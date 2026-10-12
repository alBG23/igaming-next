import { getPlayersData, getCasinoGamesData, getPaymentsData, getAffiliateReports, getGamesCatalog } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function TestPage() {
  let playersResponse = { data: [] as any[], count: 0 };
  let playersError: string | null = null;
  let gamesResponse = { data: [] as any[], count: 0, error: null as any };
  let paymentsResponse = { data: [] as any[], count: 0, error: null as any };
  let affiliateResponse = { data: [] as any[], count: 0 };
  let affiliateError: string | null = null;
  let catalogResponse = { data: [] as any[], count: 0 };
  let catalogError: string | null = null;

  try {
    const res = await getPlayersData({ page: 1, pageSize: 5 });
    if (res) playersResponse = res;
  } catch (err: any) {
    playersError = err.message || 'Unknown error';
    console.warn('TestPage: players fetch skipped', err);
  }

  try {
    const res = await getCasinoGamesData({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      page: 1,
      pageSize: 5
    });
    if (res) gamesResponse = res;
  } catch (err: any) {
    console.warn('TestPage: games fetch skipped', err);
  }

  try {
    const res = await getPaymentsData({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      page: 1,
      pageSize: 5
    });
    if (res) paymentsResponse = res;
  } catch (err: any) {
    console.warn('TestPage: payments fetch skipped', err);
  }

  try {
    const res = await getAffiliateReports({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      page: 1,
      pageSize: 5
    });
    if (res) affiliateResponse = res;
  } catch (err: any) {
    affiliateError = err.message || 'Unknown error';
    console.warn('TestPage: affiliate fetch skipped', err);
  }

  try {
    const res = await getGamesCatalog({
      page: 1,
      pageSize: 5,
      filters: {
        provider: undefined,
        category: undefined
      }
    });
    if (res) catalogResponse = res;
  } catch (err: any) {
    catalogError = err.message || 'Unknown error';
    console.warn('TestPage: catalog fetch skipped', err);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-8">
        {/* Players Data */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Players Data</h2>
          {playersError ? (
            <p className="text-red-500">Error: {playersError}</p>
          ) : (
            <div>
              <p>Total Players: {playersResponse.count}</p>
              <div className="mt-4">
                {playersResponse.data.map((player: any) => (
                  <div key={player.id} className="border-b py-2">
                    <p>ID: {player.id}</p>
                    <p>Created: {formatDate(player.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Casino Games Data */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Casino Games Data</h2>
          {gamesResponse.error ? (
            <p className="text-red-500">Error: {gamesResponse.error.message}</p>
          ) : (
            <div>
              <p>Total Games: {gamesResponse.count}</p>
              <div className="mt-4">
                {gamesResponse.data.map((game: any) => (
                  <div key={game.id} className="border-b py-2">
                    <p>ID: {game.id}</p>
                    <p>Game ID: {game.game_id}</p>
                    <p>Created: {formatDate(game.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payments Data */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Payments Data</h2>
          {paymentsResponse.error ? (
            <p className="text-red-500">Error: {paymentsResponse.error.message}</p>
          ) : (
            <div>
              <p>Total Payments: {paymentsResponse.count}</p>
              <div className="mt-4">
                {paymentsResponse.data.map((payment: any) => (
                  <div key={payment.id} className="border-b py-2">
                    <p>ID: {payment.id}</p>
                    <p>Amount: {payment.amount_cents}</p>
                    <p>Created: {formatDate(payment.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Affiliate Reports */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Affiliate Reports</h2>
          {affiliateError ? (
            <p className="text-red-500">Error: {affiliateError}</p>
          ) : (
            <div>
              <p>Total Reports: {affiliateResponse.count}</p>
              <div className="mt-4">
                {affiliateResponse.data.map((report: any) => (
                  <div key={report.id} className="border-b py-2">
                    <p>ID: {report.id}</p>
                    <p>Date: {formatDate(report.date)}</p>
                    <p>Partner ID: {report.partner_id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Games Catalog */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Games Catalog</h2>
          {catalogError ? (
            <p className="text-red-500">Error: {catalogError}</p>
          ) : (
            <div>
              <p>Total Games: {catalogResponse.count}</p>
              <div className="mt-4">
                {catalogResponse.data.map((game: any) => (
                  <div key={game.id} className="border-b py-2">
                    <p>ID: {game.id}</p>
                    <p>Title: {game.title || game.name}</p>
                    <p>Provider: {game.provider}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}