import React, { useState, useEffect } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH, FILE_UPLOAD_URL } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Loader } from "lucide-react";




function Services() {

  const d = new Date();
	const formattedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  //console.log(formattedDate);
  const [loader, setLoader] = useState(false);

  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [icon, setIcon] = useState(null);

  const [ParentId, setParentId] = useState('');
  const [ParentTitle, setParentTitle] = useState('');
  const [MainId, setMainId] = useState('');


  const fetchService = async (parentId, title) => {
    try {
      let response = '';
      if (parentId) {
        setParentId(parentId)
        setParentTitle(title)
        response = await axiosConfig.get(`/api/service/sub/${parentId}`);
      }
      else {
        setParentId('')
        setParentTitle('')
        response = await axiosConfig.get('/api/service/main');
      }

      if (response.status === 200) {
        setServices(response.data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchService();
  }, []);

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this service?');

    if (isConfirmed && id) {
      try {
        const response = await axiosConfig.delete(`/api/service/delete/${id}`)
        //console.log(response);

        if (response.status == 200) {
          setServices(prev => prev.filter(service => service.id !== id));
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

  const handleOpenModal = (service = null) => {
    setEditingService(service);
    if (service != null) {
      setMainId(service.parentId);
    }
    else {
      setMainId('');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingService(null);
    setModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    setLoader(true);
    e.preventDefault();
    const form = e.target;
    //console.log(icon);

    let filesStr = '';
    if (icon) {


      const formData = new FormData();
      if (editingService) {
        formData.append('oldFile', editingService.icon);
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
    if (editingService) {

      const newService = {
        id: editingService?.id || Date.now(),
        title: form.title.value.trim(),
        status: form.status.value,
        // parentId: form.parentId.value || null,
        icon: filesStr,
        createdAt: editingService?.createdAt || formattedDate,
      };

      if (editingService.icon != '' && filesStr == '') {
        newService.icon = editingService.icon;
      }

      try {
        const response = await axiosConfig.put(`/api/service/update/${editingService.id}`, newService)
        //console.log(response);

        if (response.status == 200) {
          const newService = {
            id: editingService.id,
            title: form.title.value,
            status: form.status.value,
            parentId: ParentId,
            icon: filesStr,
            createdAt: editingService?.createdAt || formattedDate,
          };
          if (editingService.icon != '' && filesStr == '') {
            newService.icon = editingService.icon;
          }
          console.log(newService);

          setServices(prev => prev.map(s => s.id === editingService.id ? newService : s));
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
        title: form.title.value.trim(),
        parentId: form.parentId.value.trim() || null,
        icon: filesStr
      };
      try {
        const response = await axiosConfig.post('/api/service/add', value)
        //console.log(response);

        if (response.status == 200 && response.data.insertId && form.parentId.value=='') {
          const newService = {
            id: response.data.insertId,
            title: form.title.value,
            status: 'Active',
            parentId: form.parentId.value || null,
            icon: filesStr,
            createdAt: editingService?.createdAt || formattedDate,
          };
          setServices(prev => [newService, ...prev]);
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
    setMainId('')
    handleCloseModal();
  };

  const mainServices = services.filter(s => s.parentId === null);

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
      ));
    };

  const toggleStatus = (service) => {
    const newStatus = service.status === "Active" ? "Inactive" : "Active";

    confirmToast(`Change status to ${newStatus}?`, async () => {
      const updatedservice = { ...service, status: newStatus };

      try {
        const response = await axiosConfig.put(`/api/service/updatestatus/${service.id}`, updatedservice);

        if (response.status === 200) {
          setServices(prev =>
            prev.map(u => u.id === service.id ? { ...u, status: newStatus } : u)
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
    {
      name: 'Service Name', selector: row => row.title, sortable: true,
      cell: row => (
        <div className="flex items-center">
          {/* Check if there is an image */}
          {row.icon ? (
            <img src={`${FILE_PATH}/uploads/${row.icon}`} alt={row.title} className="w-10 rounded-full mr-2" />
          ) : null}
          <span>{row.title}</span>
        </div>
      )
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
    // {
    //   name: 'Type',
    //   cell: row => (
    //     <span className="text-sm text-gray-600">
    //       {row.parentId ? `Sub of ID ${row.parentId}` : 'Main Service'}
    //     </span>
    //   ),
    // },
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy hh:mm a'), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div>

          <button className="text-blue-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit Service'} onClick={() => handleOpenModal(row)}><Pencil size={15} /></button>
          <button className="text-red-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete Service'} onClick={() => handleDelete(row.id)}><Trash size={15} /></button>
          {!row.parentId ? (<button className="text-orange-600 px-1 py-[4px] rounded border hover:underline text-sm cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'View Sub Service'} onClick={() => fetchService(row.id, row.title)}><Eye size={15} /></button>) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 table_header_services">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]">{ParentId ? (`${ParentTitle} - Sub Services`) : 'Main Services'} </h1>
        <div className="flex gap-3">
          {ParentId ? (<button class="bg-[#f58737] text-white px-2 py-1.5 rounded text-sm cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'View Main Service'} onClick={() => fetchService()}><ArrowLeft size={20} /></button>) : <button
            onClick={() => handleOpenModal()}
            data-tooltip-id="my-tooltip"
            data-tooltip-content={'Add Service'}
            className="bg-[#f58737] text-white px-2 py-1.5 rounded text-sm cursor-pointer"
          >Add Service
            {/* <Plus size={18} /> */}
          </button>}
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />



        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredServices}
        pagination
        highlightOnHover
        striped
        responsive
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500/50 z-50 flex justify-end">
          {/* Side panel */}
          <div className="h-full w-full sm:w-[400px] bg-white shadow-lg p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingService ? "Edit Service" : "Add Service"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">



              {editingService ? <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  defaultValue={editingService?.status || 'Active'}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
                :
                <div>
                  <label className="block text-sm font-medium pb-1">Parent Service</label>
                  <select
                    name="parentId"
                    defaultValue={editingService?.parentId || ''}
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                    onChange={(e) => setMainId(e.target.value)}
                  >
                    <option value="">Add New Main Service</option>
                    {mainServices.map(main => (
                      <option key={main.id} value={main.id}>
                        {main.title}
                      </option>
                    ))}
                  </select>
                </div>
              }

              {MainId ?
                <div>
                  <label className="block text-sm font-medium pb-1">Service Icon</label>
                  <input
                    type="file"
                    name="icon"
                    onChange={(e) => setIcon(e.target.files[0])}
                    accept="image/*"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                : null
              }

              <div>
                <label className="block text-sm font-medium pb-1">Service Name</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingService?.title || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>


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
                  {editingService ? 'Update' : 'Create'}
                </button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;
