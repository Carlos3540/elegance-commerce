// src/components/admin/AdminOverviewWithFilters.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Package, Users,
  ArrowUpRight, ArrowDownRight, TrendingUp,
  AlertTriangle, ChevronRight, Calendar, ChevronDown,
} from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';

export type DatePreset = 'today'|'yesterday'|'last7'|'last30'|'thisMonth'|'lastMonth'|'thisYear'|'lastYear'|'custom';
export interface DateRange { from: Date; to: Date; preset: DatePreset; }

const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const eod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const getPresetRange = (preset: DatePreset, cf?: Date, ct?: Date): DateRange => {
  const now = new Date(); const today = sod(now);
  switch (preset) {
    case 'today':     return { from: today, to: eod(now), preset };
    case 'yesterday': { const y=new Date(today); y.setDate(y.getDate()-1); return { from:y, to:eod(y), preset }; }
    case 'last7':     { const f=new Date(today); f.setDate(f.getDate()-6); return { from:f, to:eod(now), preset }; }
    case 'last30':    { const f=new Date(today); f.setDate(f.getDate()-29); return { from:f, to:eod(now), preset }; }
    case 'thisMonth': return { from: new Date(now.getFullYear(),now.getMonth(),1), to:eod(now), preset };
    case 'lastMonth': { const f=new Date(now.getFullYear(),now.getMonth()-1,1); const t=new Date(now.getFullYear(),now.getMonth(),0); return { from:f, to:eod(t), preset }; }
    case 'thisYear':  return { from: new Date(now.getFullYear(),0,1), to:eod(now), preset };
    case 'lastYear':  { const f=new Date(now.getFullYear()-1,0,1); const t=new Date(now.getFullYear()-1,11,31); return { from:f, to:eod(t), preset }; }
    case 'custom':    return { from: cf?sod(cf):today, to:ct?eod(ct):eod(now), preset };
    default:          return { from: new Date(now.getFullYear(),now.getMonth(),1), to:eod(now), preset };
  }
};

export const PRESET_LABELS: Record<DatePreset,string> = {
  today:'Hoy', yesterday:'Ayer', last7:'Últimos 7 días', last30:'Últimos 30 días',
  thisMonth:'Este mes', lastMonth:'Mes anterior', thisYear:'Este año', lastYear:'Año anterior', custom:'Personalizado',
};

const fmtDate = (d: Date) => d.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
const COP = (n: number) => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(n);

export const useDateFilter = (initial: DatePreset = 'thisMonth') => {
  const [range, setRange] = useState<DateRange>(() => getPresetRange(initial));
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const applyPreset = useCallback((p: DatePreset) => {
    if (p==='custom') {
      const f=customFrom?new Date(customFrom+'T00:00:00'):new Date();
      const t=customTo?new Date(customTo+'T23:59:59'):new Date();
      setRange(getPresetRange('custom',f,t));
    } else setRange(getPresetRange(p));
  },[customFrom,customTo]);
  const applyCustom = useCallback(() => {
    if (!customFrom||!customTo) return;
    setRange(getPresetRange('custom',new Date(customFrom+'T00:00:00'),new Date(customTo+'T23:59:59')));
  },[customFrom,customTo]);
  const filterByRange = useCallback(<T extends {created_at:string}>(items:T[]):T[] =>
    items.filter(i=>{ const d=new Date(i.created_at); return d>=range.from&&d<=range.to; }),[range]);
  return { range, customFrom, customTo, setCustomFrom, setCustomTo, applyPreset, applyCustom, filterByRange };
};

const PRESET_GROUPS = [
  {label:'Rápido',  presets:['today','yesterday'] as DatePreset[]},
  {label:'Semanas', presets:['last7','last30'] as DatePreset[]},
  {label:'Mes',     presets:['thisMonth','lastMonth'] as DatePreset[]},
  {label:'Año',     presets:['thisYear','lastYear'] as DatePreset[]},
];

export const DateFilterPicker: React.FC<{
  range:DateRange; customFrom:string; customTo:string;
  onSetCustomFrom:(v:string)=>void; onSetCustomTo:(v:string)=>void;
  onApplyPreset:(p:DatePreset)=>void; onApplyCustom:()=>void;
}> = ({ range,customFrom,customTo,onSetCustomFrom,onSetCustomTo,onApplyPreset,onApplyCustom }) => {
  const [open, setOpen] = useState(false);
  const label = range.preset==='custom'
    ? `${fmtDate(range.from)} — ${fmtDate(range.to)}`
    : PRESET_LABELS[range.preset];
  const inp = { flex:1,padding:'7px 10px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:'none',colorScheme:'dark' as const };
  return (
    <div style={{position:'relative',zIndex:50}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 16px',borderRadius:10,background:'rgba(125,164,255,0.09)',border:'1px solid rgba(125,164,255,0.22)',color:'#7da4ff',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap'}}>
        <Calendar size={14}/>{label}
        <ChevronDown size={13} style={{opacity:0.7,transform:open?'rotate(180deg)':'none',transition:'transform 0.2s'}}/>
      </button>
      {open && (<>
        <div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,zIndex:40}}/>
        <motion.div initial={{opacity:0,y:6,scale:0.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.15}}
          style={{position:'absolute',top:'110%',right:0,zIndex:50,minWidth:300,background:'#0c0e1a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,boxShadow:'0 20px 60px rgba(0,0,0,0.6)',overflow:'hidden'}}>
          <div style={{padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            {PRESET_GROUPS.map(g=>(
              <div key={g.label} style={{marginBottom:10}}>
                <p style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>{g.label}</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {g.presets.map(p=>(
                    <button key={p} onClick={()=>{onApplyPreset(p);setOpen(false);}}
                      style={{padding:'5px 12px',borderRadius:8,fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:'pointer',background:range.preset===p?'rgba(125,164,255,0.18)':'rgba(255,255,255,0.04)',border:range.preset===p?'1px solid rgba(125,164,255,0.4)':'1px solid rgba(255,255,255,0.07)',color:range.preset===p?'#7da4ff':'rgba(255,255,255,0.55)'}}>
                      {PRESET_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:'12px 14px'}}>
            <p style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Rango personalizado</p>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="date" value={customFrom} onChange={e=>onSetCustomFrom(e.target.value)} style={inp}/>
              <span style={{color:'rgba(255,255,255,0.3)',fontSize:12}}>—</span>
              <input type="date" value={customTo} onChange={e=>onSetCustomTo(e.target.value)} style={inp}/>
              <button onClick={()=>{onApplyCustom();setOpen(false);}} style={{padding:'7px 14px',borderRadius:8,background:'#7da4ff',border:'none',color:'#0c0e1a',fontSize:12,fontWeight:800,fontFamily:"'DM Sans',sans-serif",cursor:'pointer',whiteSpace:'nowrap'}}>Aplicar</button>
            </div>
          </div>
        </motion.div>
      </>)}
    </div>
  );
};

const StatCard = ({label,value,change,positive,icon:Icon,sub,delay}:any) => (
  <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay,duration:0.4,ease:[0.23,1,0.32,1]}}
    style={{background:'#0f1120',border:'1px solid rgba(255,255,255,0.065)',borderRadius:18,padding:'24px 26px'}}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
      <div style={{width:44,height:44,borderRadius:12,background:'rgba(99,153,255,0.09)',border:'1px solid rgba(99,153,255,0.14)',display:'flex',alignItems:'center',justifyContent:'center',color:'#7da4ff'}}><Icon size={18}/></div>
      {change!==undefined&&<div style={{display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:positive?'#34d399':'#f87171',background:positive?'rgba(52,211,153,0.09)':'rgba(248,113,113,0.09)',padding:'4px 10px',borderRadius:8,fontFamily:"'DM Sans',sans-serif"}}>{positive?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>}{Math.abs(change)}%</div>}
    </div>
    <p style={{fontSize:30,fontWeight:800,color:'#fff',fontFamily:"'DM Sans',sans-serif",letterSpacing:'-0.04em',lineHeight:1}}>{value}</p>
    <p style={{fontSize:14,color:'rgba(255,255,255,0.35)',fontFamily:"'DM Sans',sans-serif",marginTop:8}}>{label}</p>
    {sub&&<p style={{fontSize:12,color:'rgba(255,255,255,0.2)',fontFamily:"'DM Sans',sans-serif",marginTop:4}}>{sub}</p>}
  </motion.div>
);

const STATUS_COLOR: Record<string,string> = {pending:'#fbbf24',confirmed:'#7da4ff',processing:'#a78bfa',shipped:'#7da4ff',delivered:'#34d399',cancelled:'#f87171',refunded:'#f87171'};
const STATUS_BG:    Record<string,string> = {pending:'rgba(251,191,36,0.09)',confirmed:'rgba(99,153,255,0.09)',processing:'rgba(167,139,250,0.09)',shipped:'rgba(99,153,255,0.09)',delivered:'rgba(52,211,153,0.09)',cancelled:'rgba(248,113,113,0.09)',refunded:'rgba(248,113,113,0.09)'};
const STATUS_LABEL: Record<string,string> = {pending:'Pendiente',confirmed:'Confirmado',processing:'Procesando',shipped:'En camino',delivered:'Entregado',cancelled:'Cancelado',refunded:'Reembolsado'};

const Overview = () => {
  const { stats, isLoading } = useAdminStats();
  const { range, customFrom, customTo, setCustomFrom, setCustomTo, applyPreset, applyCustom } = useDateFilter('thisMonth');
  const months = ['E','F','M','A','M','J','J','A','S','O','N','D'];

  const filtered = useMemo(() => {
    if (!stats) return null;
    const isLastMonth = range.preset==='lastMonth';
    return {
      revenue: isLastMonth ? stats.revenueThisMonth*(1-stats.revenueChange/100) : stats.revenueThisMonth,
      orders:  isLastMonth ? Math.round(stats.ordersThisMonth*(1-stats.ordersChange/100)) : stats.ordersThisMonth,
      revenueChange: isLastMonth ? -stats.revenueChange : stats.revenueChange,
      ordersChange:  isLastMonth ? -stats.ordersChange  : stats.ordersChange,
    };
  },[stats,range]);

  if (isLoading||!stats) return (
    <div style={{padding:'30px 36px'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{background:'#0f1120',border:'1px solid rgba(255,255,255,0.065)',borderRadius:18,padding:'24px 26px',height:140,opacity:0.5}}/>
        ))}
      </div>
    </div>
  );

  const maxSales = Math.max(...stats.monthlySales,1);
  const currentMonth = new Date().getMonth();

  const cards = [
    {label:'Ingresos del período',value:COP(filtered?.revenue??stats.revenueThisMonth),change:filtered?.revenueChange??stats.revenueChange,positive:(filtered?.revenueChange??stats.revenueChange)>=0,icon:DollarSign,sub:`Total histórico: ${COP(stats.totalRevenue)}`,delay:0},
    {label:'Órdenes del período',value:String(filtered?.orders??stats.ordersThisMonth),change:filtered?.ordersChange??stats.ordersChange,positive:(filtered?.ordersChange??stats.ordersChange)>=0,icon:ShoppingBag,sub:`${stats.totalOrders} órdenes en total`,delay:0.06},
    {label:'Productos activos',value:String(stats.activeProducts),change:undefined,positive:true,icon:Package,sub:`${stats.totalProducts} en catálogo`,delay:0.12},
    {label:'Usuarios totales',value:String(stats.totalUsers),change:stats.newUsersThisMonth,positive:true,icon:Users,sub:`+${stats.newUsersThisMonth} este mes`,delay:0.18},
  ];

  return (
    <div style={{padding:'30px 36px'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:26}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:"'DM Sans',sans-serif",letterSpacing:'-0.03em',margin:0}}>Resumen</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Sans',sans-serif",marginTop:4}}>
            {range.preset==='custom'?`${fmtDate(range.from)} — ${fmtDate(range.to)}`:PRESET_LABELS[range.preset]}
          </p>
        </div>
        <DateFilterPicker range={range} customFrom={customFrom} customTo={customTo}
          onSetCustomFrom={setCustomFrom} onSetCustomTo={setCustomTo}
          onApplyPreset={applyPreset} onApplyCustom={applyCustom}/>
      </div>

      {/* KPI Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18,marginBottom:26}}>
        {cards.map(s=><StatCard key={s.label} {...s}/>)}
      </div>

      {/* Alerta stock */}
      {stats.lowStockProducts>0&&(
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
          style={{background:'rgba(251,191,36,0.07)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:12,padding:'12px 20px',marginBottom:22,display:'flex',alignItems:'center',gap:10}}>
          <AlertTriangle size={16} style={{color:'#fbbf24',flexShrink:0}}/>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.7)',fontFamily:"'DM Sans',sans-serif"}}>
            <strong style={{color:'#fbbf24'}}>{stats.lowStockProducts} productos</strong> con stock bajo.
          </p>
        </motion.div>
      )}

      {/* Gráfica + Top Productos */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:22,marginBottom:22}}>
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.22}}
          style={{background:'#0f1120',border:'1px solid rgba(255,255,255,0.065)',borderRadius:18,padding:'26px 28px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:26}}>
            <div>
              <p style={{fontSize:17,fontWeight:800,color:'#fff',fontFamily:"'DM Sans',sans-serif",letterSpacing:'-0.02em'}}>Ventas {new Date().getFullYear()}</p>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Sans',sans-serif",marginTop:3}}>Total: {COP(stats.totalRevenue)}</p>
            </div>
            {stats.revenueChange!==0&&(
              <div style={{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:700,color:stats.revenueChange>=0?'#34d399':'#f87171',background:stats.revenueChange>=0?'rgba(52,211,153,0.09)':'rgba(248,113,113,0.09)',padding:'5px 12px',borderRadius:10,fontFamily:"'DM Sans',sans-serif"}}>
                <TrendingUp size={14}/> {stats.revenueChange>0?'+':''}{stats.revenueChange}%
              </div>
            )}
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:7,height:130}}>
            {stats.monthlySales.map((val,i)=>{
              const h=(val/maxSales)*100;
              const isHighlighted=(range.preset==='thisMonth'&&i===currentMonth)||(range.preset==='lastMonth'&&i===currentMonth-1)||(val===maxSales&&val>0);
              return (
                <motion.div key={i} initial={{height:0}} animate={{height:`${Math.max(h,2)}%`}}
                  transition={{delay:0.3+i*0.04,duration:0.55,ease:[0.23,1,0.32,1]}}
                  title={`${months[i]}: ${COP(val)}`}
                  style={{flex:1,background:isHighlighted&&val>0?'linear-gradient(180deg,#7da4ff,#3b6fd4)':'rgba(99,153,255,0.2)',borderRadius:'5px 5px 0 0',cursor:'default',transition:'background 0.2s'}}/>
              );
            })}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
            {months.map((m,i)=><span key={i} style={{flex:1,textAlign:'center',fontSize:11,color:'rgba(255,255,255,0.22)',fontFamily:"'DM Sans',sans-serif"}}>{m}</span>)}
          </div>
        </motion.div>

        {/* Top Productos */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.26}}
          style={{background:'#0f1120',border:'1px solid rgba(255,255,255,0.065)',borderRadius:18,padding:'26px 24px'}}>
          <p style={{fontSize:17,fontWeight:800,color:'#fff',fontFamily:"'DM Sans',sans-serif",marginBottom:4,letterSpacing:'-0.02em'}}>Top Productos</p>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Sans',sans-serif",marginBottom:22}}>Más vendidos</p>
          {stats.topProducts.length===0
            ?<p style={{fontSize:13,color:'rgba(255,255,255,0.2)',fontFamily:"'DM Sans',sans-serif",textAlign:'center',paddingTop:20}}>Sin ventas aún</p>
            :<div style={{display:'flex',flexDirection:'column',gap:16}}>
              {stats.topProducts.map((p:any,i:number)=>(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.2)',width:18,fontFamily:"'DM Sans',sans-serif"}}>{i+1}</span>
                  <img src={p.image_url||'/assets/placeholder.svg'} alt={p.name} style={{width:36,height:36,borderRadius:8,objectFit:'cover',flexShrink:0,border:'1px solid rgba(255,255,255,0.07)'}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.8)',fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</p>
                    <p style={{fontSize:11,color:'rgba(255,255,255,0.25)',fontFamily:"'DM Sans',sans-serif"}}>{COP(p.price)}</p>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:'#34d399',fontFamily:"'DM Sans',sans-serif"}}>{p.totalSold}</span>
                </div>
              ))}
            </div>}
        </motion.div>
      </div>

      {/* Mini KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:22}}>
        {[
          {label:'En tránsito / procesando',value:stats.activeOrders,   color:'#7da4ff'},
          {label:'Pendientes de despacho',  value:stats.pendingDispatch,color:'#fbbf24'},
          {label:'Entregados hoy',           value:stats.deliveredToday, color:'#34d399'},
        ].map(k=>(
          <motion.div key={k.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            style={{background:'#0f1120',border:'1px solid rgba(255,255,255,0.065)',borderRadius:14,padding:'18px 20px',display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:k.color,flexShrink:0}}/>
            <div>
              <p style={{fontSize:22,fontWeight:800,color:k.color,fontFamily:"'DM Sans',sans-serif",letterSpacing:'-0.03em',lineHeight:1}}>{k.value}</p>
              <p style={{fontSize:12,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Sans',sans-serif",marginTop:4}}>{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Órdenes Recientes */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
        style={{background:'#0f1120',border:'1px solid rgba(255,255,255,0.065)',borderRadius:18,overflow:'hidden'}}>
        <div style={{padding:'22px 28px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.055)'}}>
          <div>
            <p style={{fontSize:17,fontWeight:800,color:'#fff',fontFamily:"'DM Sans',sans-serif",letterSpacing:'-0.02em'}}>Órdenes Recientes</p>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.3)',fontFamily:"'DM Sans',sans-serif",marginTop:3}}>Últimas 5 transacciones</p>
          </div>
        </div>
        {stats.recentOrders.length===0
          ?<div style={{padding:'40px',textAlign:'center'}}><p style={{fontSize:14,color:'rgba(255,255,255,0.2)',fontFamily:"'DM Sans',sans-serif"}}>No hay órdenes todavía</p></div>
          :<table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.045)'}}>
                {['ID','Cliente','Producto','Monto','Estado'].map(h=>(
                  <th key={h} style={{padding:'12px 28px',textAlign:'left',fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.22)',fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.08em',textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o:any,i:number)=>(
                <motion.tr key={o.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35+i*0.05}}
                  style={{borderBottom:'1px solid rgba(255,255,255,0.032)'}}>
                  <td style={{padding:'16px 28px',fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.38)',fontFamily:"'DM Sans',sans-serif",fontVariantNumeric:'tabular-nums'}}>{o.shortId}</td>
                  <td style={{padding:'16px 28px',fontSize:14,fontWeight:500,color:'rgba(255,255,255,0.75)',fontFamily:"'DM Sans',sans-serif"}}>{o.customer}</td>
                  <td style={{padding:'16px 28px',fontSize:13,color:'rgba(255,255,255,0.45)',fontFamily:"'DM Sans',sans-serif"}}>{o.product}</td>
                  <td style={{padding:'16px 28px',fontSize:15,fontWeight:800,color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>{COP(o.amount)}</td>
                  <td style={{padding:'16px 28px'}}>
                    <span style={{fontSize:12,fontWeight:700,color:STATUS_COLOR[o.status]||'#fff',background:STATUS_BG[o.status]||'rgba(255,255,255,0.05)',padding:'4px 12px',borderRadius:8,fontFamily:"'DM Sans',sans-serif"}}>
                      {STATUS_LABEL[o.status]||o.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>}
      </motion.div>
    </div>
  );
};

export default Overview;
