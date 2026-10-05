import { computed, ref, type Ref } from 'vue';
import { obtenerMiFlota, type Usuario } from '@/services/usuarioService';
import { filtrarPorRegion, filtrarSolicitantes } from '@/utils/empleadosSolicitud';

/**
 * Employees available for a request form. The backend already scopes /mi-flota to the
 * logged-in user's region (admins get every region), so `region` only narrows it further
 * when an admin picks one.
 */
export function useEmpleadosSolicitud(region: Ref<string | null | undefined>) {
  const empleados = ref<Usuario[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const cargar = async () => {
    loading.value = true;
    error.value = null;
    try {
      const resp = await obtenerMiFlota();
      empleados.value = resp.data ?? [];
    } catch (e) {
      console.error('Error al cargar empleados para la solicitud:', e);
      error.value = 'No se pudieron cargar los empleados de la región';
      empleados.value = [];
    } finally {
      loading.value = false;
    }
  };

  const empleadosRegion = computed(() => filtrarPorRegion(empleados.value, region.value));
  const solicitantes = computed(() => filtrarSolicitantes(empleadosRegion.value));

  const buscarPorNumReparto = (numReparto: string): Usuario | undefined =>
    empleadosRegion.value.find(e => e.numReparto === numReparto);

  return { empleadosRegion, solicitantes, loading, error, cargar, buscarPorNumReparto };
}
