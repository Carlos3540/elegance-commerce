import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

const Profile = () => {
  const { profile, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">Mi Perfil</h1>
        <div className="grid gap-8">
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
            <div className="space-y-3">
              <p><span className="text-muted-foreground">Nombre:</span> {profile?.full_name || 'No especificado'}</p>
              <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
              <p><span className="text-muted-foreground">Miembro desde:</span> {new Date(profile?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;