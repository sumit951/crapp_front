import React, { useState, useEffect } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH, FILE_UPLOAD_URL } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Plus } from "lucide-react";




function Subjectareas() {
  
  const [subjectareas, setSubjectareas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingsubjectarea, setEditingsubjectarea] = useState(null);
  const [icon, setIcon] = useState(null);

  const fetchsubjectarea = async () => {
    try {
      const response = await axiosConfig.get('/api/subjectarea/main');
      

      if (response.status === 200) {
        setSubjectareas(response.data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchsubjectarea();
  }, []);

  const filteredsubjectareas = subjectareas.filter(subjectarea =>
    subjectarea.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this Subject area?');

    if (isConfirmed && id) {
      try {
        const response = await axiosConfig.delete(`/api/subjectarea/delete/${id}`)
        //console.log(response);

        if (response.status == 200) {
          setSubjectareas(prev => prev.filter(subjectarea => subjectarea.id !== id));
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
  };

  const handleOpenModal = (subjectarea = null) => {
    setEditingsubjectarea(subjectarea);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingsubjectarea(null);
    setModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    //console.log(icon);

    let filesStr = '';
    if (icon) {


      const formData = new FormData();
      if (editingsubjectarea) {
        formData.append('oldFile', editingsubjectarea.icon);
      }

      formData.append('files[]', icon);

      const response = await axiosConfig.post(`${FILE_UPLOAD_URL}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      //console.log(response);


      //console.log(response.data['files']);

      response.data['files'].forEach((file) => {
        filesStr += `${file.filename}||`
      });

      filesStr = filesStr.replace(/\|\|$/, ''); // Remove last ||

    }
    if (editingsubjectarea) {

      const newsubjectarea = {
        id: editingsubjectarea?.id || Date.now(),
        title: form.title.value.trim(),
        status: form.status.value,
        icon: filesStr,
        createdAt: editingsubjectarea?.createdAt || new Date().toISOString().split('T')[0],
      };

      if (editingsubjectarea.icon != '' && filesStr == '') {
        newsubjectarea.icon = editingsubjectarea.icon;
      }

      try {
        const response = await axiosConfig.put(`/api/subjectarea/update/${editingsubjectarea.id}`, newsubjectarea)
        //console.log(response);

        if (response.status == 200) {
          const newsubjectarea = {
            id: editingsubjectarea.id,
            title: form.title.value,
            status: form.status.value,
            icon: filesStr,
            createdAt: editingsubjectarea?.createdAt || new Date().toISOString().split('T')[0],
          };
          if (editingsubjectarea.icon != '' && filesStr == '') {
            newsubjectarea.icon = editingsubjectarea.icon;
          }
          //console.log(newsubjectarea);

          setSubjectareas(prev => prev.map(s => s.id === editingsubjectarea.id ? newsubjectarea : s));
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
        title: form.title.value.trim(),
        icon: filesStr
      };
      try {
        const response = await axiosConfig.post('/api/subjectarea/add', value)
        //console.log(response);

        if (response.status == 200 && response.data.insertId) {
          const newsubjectarea = {
            id: response.data.insertId,
            title: form.title.value,
            status: 'Active',
            icon: filesStr,
            createdAt: editingsubjectarea?.createdAt || new Date().toISOString().split('T')[0],
          };
          setSubjectareas(prev => [...prev, newsubjectarea]);
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
    {
      name: 'Title', selector: row => row.title, sortable: true,
      cell: row => (
        <div className="flex items-center">
          {/* Check if there is an image */}
          {row.icon ? (
            <img src={`${FILE_PATH}/${row.icon}`} alt={row.title} className="w-10 rounded-full mr-2" />
          ) : null}
          <span>{row.title}</span>
        </div>
      )
    },
    {
      name: 'Status',
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
          {row.status}
        </span>
      ),
    },
    // {
    //   name: 'Type',
    //   cell: row => (
    //     <span className="text-sm text-gray-600">
    //       {row.parentId ? `Sub of ID ${row.parentId}` : 'Main subjectarea'}
    //     </span>
    //   ),
    // },
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy HH:mm '), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div>

          <button className="text-blue-600 hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit Subject Area'} onClick={() => handleOpenModal(row)}><Pencil size={15} /></button>
          <button className="text-red-600 hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete Subject Area'} onClick={() => handleDelete(row.id)}><Trash size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 table_header_subjectareas">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]">Subject Area</h1>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal()}
            data-tooltip-id="my-tooltip"
            data-tooltip-content={'Add subjectarea'}
            className="bg-[#f58737] text-white px-2 py-1.5 rounded text-sm"
          >Add Subject Area
            {/* <Plus size={18} /> */}
          </button>
          <input
            type="text"
            placeholder="Search Subject Area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />



        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredsubjectareas}
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
              {editingsubjectarea ? "Edit Subject Area" : "Add Subject Area"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">


              <div>
                <label className="block text-sm font-medium pb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingsubjectarea?.title || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium pb-1">Icon</label>
                <input
                  type="file"
                  name="icon"
                  onChange={(e) => setIcon(e.target.files[0])}
                  accept="image/*"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {editingsubjectarea ? <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  defaultValue={editingsubjectarea?.status || 'Active'}
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
                  {editingsubjectarea ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subjectareas;
