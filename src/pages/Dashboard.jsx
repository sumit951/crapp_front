import React from 'react'

function Dashboard() {
  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-[#092e46]">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-[#092e46]">Users</h2>
            <p className="text-2xl font-bold mt-2">1,245</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-[#092e46]">Revenue</h2>
            <p className="text-2xl font-bold mt-2">INR 23,450</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-[#092e46]">Orders</h2>
            <p className="text-2xl font-bold mt-2">320</p>
          </div>
        </div>

        {/* <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#092e46] mb-4">Recent Activity</h2>
          <ul className="space-y-3 text-gray-700 text-sm">
            <li>✅ New user registered: <strong>john@example.com</strong></li>
            <li>📦 Order #1023 has been shipped</li>
            <li>💬 New support ticket created by <strong>alice@domain.com</strong></li>
          </ul>
        </div> */}
      </div>
    </>
  )
}

export default Dashboard