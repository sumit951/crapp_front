import React, { useState,useEffect } from 'react';
import { Link } from "react-router-dom";
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';

import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Loader } from "lucide-react";




function Users() {

  const d = new Date();
	const formattedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  const [loader, setLoader] = useState(false);

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
    user.subjectAreaTitle.toLowerCase().includes(searchTerm.toLowerCase())
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
    setLoader(true);
    e.preventDefault();
    const form = e.target;
    
    //console.log(editinguser);
    
    if (editinguser) {

      const newuser = {
        id: editinguser?.id || Date.now(),
        firstName: editinguser.firstName,
        lastName: editinguser.lastName,
        email: editinguser.email,
        mobile: editinguser.mobile,
        subjectAreaId: editinguser.subjectAreaId,
        subjectAreaTitle: editinguser.subjectAreaTitle,
        status: form.status.value,
        createdAt: editinguser?.createdAt || formattedDate,
      };

     

      try {
        const response = await axiosConfig.put(`/api/user/update/${editinguser.id}`, newuser)
        //console.log(response);

        if (response.status == 200) {
          const newuser = {
            id: editinguser.id,
            firstName: editinguser.firstName,
            lastName: editinguser.lastName,
            email: editinguser.email,
            mobile: editinguser.mobile,
            subjectAreaId: editinguser.subjectAreaId,
            subjectAreaTitle: editinguser.subjectAreaTitle,
            status: form.status.value,
            createdAt: editinguser?.createdAt || formattedDate,
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
      setLoader(false);
    } else {
      const value = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
      };
      try {
        const response = await axiosConfig.post('/api/user/add', value)
        //console.log(response);

        if (response.status == 200 && response.data.insertId) {
          const newuser = {
            id: response.data.insertId,
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            status: 'Active',
            createdAt: editinguser?.createdAt || formattedDate,
          };
          setusers(prev => [newuser,...prev]);
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
      setLoader(false);
    }
    handleCloseModal();
  };

  const confirmToast = (message, onConfirm) => {
      toast.custom((t) => (
        <div className="bg-white p-4 rounded shadow-md border w-[300px]">
          <p className="text-sm mb-4">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm border border-gray-300 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm();
              }}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
            position: "top-right",
      });
    };

  const toggleStatus = (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";

    confirmToast(`Change status to ${newStatus}?`, async () => {
      const updatedUser = { ...user, status: newStatus };

      try {
        const response = await axiosConfig.put(`/api/user/update/${user.id}`, updatedUser);

        if (response.status === 200) {
          setusers(prev =>
            prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
          );
          toast.success(`Status updated to ${newStatus}`);
        } else {
          toast.error('Failed to update status');
        }
      } catch (error) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Error updating status');
        }
        console.error(error);
      }
    });
  };



  const columns = [
    // { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'First Name', selector: row => row.firstName, sortable: true},
    { name: 'Last Name', selector: row => row.lastName, sortable: true},
    { name: 'Email', selector: row => row.email, sortable: true, width: '280px'},
    { name: 'Mobile', selector: row => row.mobile, sortable: true},
    { name: 'Subject Area', selector: row => row.subjectAreaTitle, sortable: true},
    { name: 'Total Order',
      cell: row => (
        <Link
          to={`/orders/${row.id}`}
          className="text-blue-600 px-2 py-[1px] rounded border hover:underline text-sm cursor-pointer flex"
          data-tooltip-id="my-tooltip"
          data-tooltip-content={'View all orders'}
        >
          {row.orderCount}
        </Link>
      ),
    },
    {
      name: 'Status',
      cell: row => (
        <button
          onClick={() => toggleStatus(row)}
          className={`px-2 py-1 rounded-full text-xs font-medium focus:outline-none cursor-pointer ${
            row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 "
          }`}
          data-tooltip-id="my-tooltip" data-tooltip-content={`Click to change status`}
        >
          {row.status}
        </button>
      ),
    },

    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy hh:mm a'), sortable: true, width: '150px' },
    {
      name: 'Actions',
      cell: row => (
        <div>
          <button className="text-blue-600 px-1 py-[4px] rounded border hover:underline text-sm ml-3 cursor-pointer float-end" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit User'} onClick={() => handleOpenModal(row)}><Pencil size={15} /></button>
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
        <div className="fixed inset-0 bg-gray-500/50 z-50 flex justify-end" onClick={handleCloseModal}>
          {/* Side panel */}
          <div className="h-full w-full sm:w-[400px] bg-white shadow-lg p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                  className="px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                {loader && <Loader className="animate-spin h-6 w-6 text-gray-500" />}
                {!loader && <button
                  type="submit"
                  className="px-2 py-1 text-sm bg-[#f58737] text-white rounded cursor-pointer"
                >
                  {editinguser ? 'Update' : 'Create'}
                </button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
