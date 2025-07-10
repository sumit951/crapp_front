import React, { useState,useEffect } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Plus } from "lucide-react";




function Users() {

  const [users, setusers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editinguser, setEditinguser] = useState(null);

  
  
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
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.subjectArearTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleOpenModal = (user = null) => {
    setEditinguser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditinguser(null);
    setModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    //console.log(editinguser);
    
    if (editinguser) {

      const newuser = {
        id: editinguser?.id || Date.now(),
        userName: editinguser.userName,
        firstName: editinguser.firstName,
        lastName: editinguser.lastName,
        email: editinguser.email,
        mobile: editinguser.mobile,
        subjectAreaId: editinguser.subjectAreaId,
        subjectArearTitle: editinguser.subjectArearTitle,
        status: form.status.value,
        createdAt: editinguser?.createdAt || new Date().toISOString().split('T')[0],
      };

     

      try {
        const response = await axiosConfig.put(`/api/user/update/${editinguser.id}`, newuser)
        //console.log(response);

        if (response.status == 200) {
          const newuser = {
            id: editinguser.id,
            userName: editinguser.userName,
            firstName: editinguser.firstName,
            lastName: editinguser.lastName,
            email: editinguser.email,
            mobile: editinguser.mobile,
            subjectAreaId: editinguser.subjectAreaId,
            subjectArearTitle: editinguser.subjectArearTitle,
            status: form.status.value,
            createdAt: editinguser?.createdAt || new Date().toISOString().split('T')[0],
          };
        
          //console.log(newuser);

          setusers(prev => prev.map(s => s.id === editinguser.id ? newuser : s));
          toast.success(response.data.message);
        }
        else {
          toast.success(response.data.message);
        }
      } catch (error) {
        // Handle known server response
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          // Fallback error
          toast.error('Something went wrong');
        }

        console.log(error); // Optional: full error logging for debugging
      }

    } else {
      const value = {
        userName: form.userName.value,
        firstName: form.firstName.value,
        lastName: form.lastName.value,
      };
      try {
        const response = await axiosConfig.post('/api/user/add', value)
        //console.log(response);

        if (response.status == 200 && response.data.insertId) {
          const newuser = {
            id: response.data.insertId,
            userName: form.userName.value,
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            status: 'Active',
            createdAt: editinguser?.createdAt || new Date().toISOString().split('T')[0],
          };
          setusers(prev => [...prev, newuser]);
          toast.success(response.data.message);
        }
        else {
          toast.success(response.data.message);
        }
      } catch (error) {
        // Handle known server response
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          // Fallback error
          toast.error('Something went wrong');
        }

        console.log(error); // Optional: full error logging for debugging
      }

    }
    handleCloseModal();
  };

  const columns = [
    // { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'First Name', selector: row => row.firstName, sortable: true},
    { name: 'Last Name', selector: row => row.lastName, sortable: true},
    { name: 'Username', selector: row => row.userName, sortable: true},
    { name: 'Email', selector: row => row.email, sortable: true, width: '250px'},
    { name: 'Mobile', selector: row => row.mobile, sortable: true},
    { name: 'Subject Area', selector: row => row.subjectArearTitle, sortable: true},
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
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy HH:mm '), sortable: true, width: '150px' },
    {
      name: 'Actions',
      cell: row => (
        <div>
          <button className="text-blue-600 hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit User'} onClick={() => handleOpenModal(row)}><Pencil size={15} /></button>
        </div>
      ),
    },
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500/50 bg-opacity-x flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editinguser ? "Edit User" : "Add User"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">

              {editinguser ? <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  defaultValue={editinguser?.status || 'Active'}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              : null }


              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 text-sm bg-[#f58737] text-white rounded"
                >
                  {editinguser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
