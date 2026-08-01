import { fetchRevenueSummary, fetchDailyRevenue } from '@/app/lib/data';
import RevenueChart from '@/app/ui/reports/revenue-chart';


export default async function Page() {
  const [summary, dailyRevenue] = await Promise.all([
    fetchRevenueSummary(),
    fetchDailyRevenue(),
  ]);

  return (
    <div className="w-full">
      <h1 className="text-2xl">Reporte de ingresos</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Hoy</p>
          <p className="mt-1 text-2xl font-semibold">
            ${summary.today.toLocaleString('es-AR')}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Esta semana</p>
          <p className="mt-1 text-2xl font-semibold">
            ${summary.thisWeek.toLocaleString('es-AR')}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Este mes</p>
          <p className="mt-1 text-2xl font-semibold">
            ${summary.thisMonth.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <RevenueChart data={dailyRevenue} />
      </div>
    </div>
  );
}