// Utilidad de desarrollo para probar el login JWT contra /api/auth/login
export async function testSpecificCredential(user: string, pass: string) {
  try {
    console.log(`🔑 Probando credencial: ${user}:${pass}`);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    });

    console.log(`📊 Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ ¡ÉXITO! Token recibido para:', data.username, '- rol:', data.rol);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${response.status} - ${errorText}`);
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.log('💥 Error de conexión:', error);
    return { success: false, error };
  }
}
