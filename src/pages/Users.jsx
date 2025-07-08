import React, { useState,useEffect } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Plus } from "lucide-react";




function Users() {

  const [users, setusers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  
  
  //console.log(alluserdata);
  const fetchuser = async (parentId,title) => {
      try {
      
        const response = await axiosConfig.get('/api/user/all');
        
        
        if (response.status === 200) {
          setusers(response.data.data);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
  useEffect(() => {
    fetchuser();
  }, []);

  const filteredusers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    // { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'First Name', selector: row => row.firstName, sortable: true},
    { name: 'Last Name', selector: row => row.lastName, sortable: true},
    { name: 'Username', selector: row => row.userName, sortable: true},
    { name: 'Email', selector: row => row.email, sortable: true, width: '300px'},
    { name: 'Mobile', selector: row => row.mobile, sortable: true},
    {
      name: 'Status',
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {row.status}
        </span>
      ),
    },
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy HH:mm '), sortable: true },
  ];

  return (
    <div className="p-6 table_header_user">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]">Manage Users</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredusers}
        pagination
        highlightOnHover
        striped
        responsive
      />
    </div>
  );
}

export default Users;
