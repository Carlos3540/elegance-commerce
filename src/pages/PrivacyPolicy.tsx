import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#fdfdfd] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6 text-blue-600">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
            Política de Privacidad
          </h1>
          <p className="text-gray-500 font-medium">
            Cumplimiento Ley 1581 de 2012 - Protección de Datos Personales (Colombia)
          </p>
        </motion.div>

        <div className="space-y-12 text-gray-700 leading-relaxed">
          <section>
            <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
              <FileText className="text-blue-500" size={20} />
              1. Identificación del Responsable
            </h2>
            <p>
              <strong>EVOLET 96</strong>, con domicilio en Colombia, es el responsable del tratamiento de sus datos personales. 
              Nos comprometemos a proteger la privacidad de nuestros usuarios y a cumplir con las disposiciones legales vigentes.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
              <Lock className="text-blue-500" size={20} />
              2. Finalidad del Tratamiento
            </h2>
            <p className="mb-4">
              Los datos personales recolectados a través de nuestra plataforma serán utilizados para las siguientes finalidades:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Procesar y gestionar sus pedidos.",
                "Realizar el envío de productos.",
                "Brindar soporte y atención al cliente.",
                "Informar sobre cambios en pedidos o servicios.",
                "Fines estadísticos y de mejora de la plataforma.",
                "Envío de promociones (previa autorización)."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                  <CheckCircle className="text-green-500 mt-1 shrink-0" size={14} />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
              <Shield className="text-blue-500" size={20} />
              3. Derechos de los Titulares
            </h2>
            <p className="mb-4">
              De acuerdo con la Ley 1581 de 2012, usted como titular de los datos tiene derecho a:
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <ul className="space-y-4 text-sm">
                <li>
                  <strong>Conocer, actualizar y rectificar</strong> sus datos personales frente a los responsables del tratamiento.
                </li>
                <li>
                  <strong>Solicitar prueba de la autorización</strong> otorgada para el tratamiento de sus datos.
                </li>
                <li>
                  <strong>Ser informado</strong> respecto del uso que se le ha dado a sus datos personales.
                </li>
                <li>
                  <strong>Revocar la autorización</strong> y/o solicitar la supresión del dato cuando en el tratamiento no se respeten los principios, derechos y garantías constitucionales y legales.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              4. Procedimiento para el ejercicio de derechos
            </h2>
            <p>
              Para ejercer sus derechos de conocer, actualizar, rectificar o suprimir sus datos personales, puede contactarnos a través de nuestro correo electrónico de soporte o mediante nuestra sección de contacto en la plataforma.
            </p>
          </section>

          <div className="pt-10 border-t border-gray-100 text-center text-sm text-gray-400">
            <p>Última actualización: Mayo 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
