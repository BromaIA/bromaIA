// pages/registro-cerrado.tsx
export default function RegistroCerrado() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4 text-center">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md">
        <h1 className="text-3xl font-bold text-pink-600 mb-4">
          ¡Registro cerrado!
        </h1>
        <p className="text-gray-800 mb-4">
          Hemos alcanzado el límite de registros gratuitos por ahora. <br />
          Si ya tienes cuenta, puedes iniciar sesión. <br />
          Si no, vuelve a intentarlo más adelante. 😉
        </p>
        <a
          href="/sign-in"
          className="inline-block mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Iniciar sesión
        </a>
      </div>
    </div>
  );
}
