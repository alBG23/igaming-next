import { getPlayersData, getCasinoGamesData, getPaymentsData, getAffiliateReports, getGamesCatalog } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default async function TestPage() {
  // Test players data
  const playersResponse = await getPlayersData({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    page: 1,
    pageSize: 5
  });

  // Test casino games data
  const gamesResponse = await getCasinoGamesData({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    page: 1,
    pageSize: 5
  });

  // Test payments data
  const paymentsResponse = await getPaymentsData({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    page: 1,
    pageSize: 5
  });

  // Test affiliate reports
  const affiliateResponse = await getAffiliateReports({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    page: 1,
    pageSize: 5
  });

  // Test games catalog
  const catalogResponse = await getGamesCatalog({
    page: 1,
    pageSize: 5,
    filters: {
      provider: undefined,
      category: undefined
    }
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-8">
        {/* Players Data */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Players Data</h2>
          {playersResponse.error ? (
            <p className="text-red-500">Error: {playersResponse.error.message}</p>
          ) : (
            <div>
              <p>Total Players: {playersResponse.count}</p>
              <div className="mt-4">
                {playersResponse.data.map((player) => (
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
                {gamesResponse.data.map((game) => (
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
                {paymentsResponse.data.map((payment) => (
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
          {affiliateResponse.error ? (
            <p className="text-red-500">Error: {affiliateResponse.error.message}</p>
          ) : (
            <div>
              <p>Total Reports: {affiliateResponse.count}</p>
              <div className="mt-4">
                {affiliateResponse.data.map((report) => (
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
          {catalogResponse.error ? (
            <p className="text-red-500">Error: {catalogResponse.error.message}</p>
          ) : (
            <div>
              <p>Total Games: {catalogResponse.count}</p>
              <div className="mt-4">
                {catalogResponse.data.map((game) => (
                  <div key={game.id} className="border-b py-2">
                    <p>ID: {game.id}</p>
                    <p>Name: {game.name}</p>
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