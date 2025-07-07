import React, { useState,useEffect } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Plus } from "lucide-react";




function Services() {
  // const initialServices = [
  //   { id: 1, name: "Content Writing", status: "Active", createdAt: "2023-05-01", parentId: null },
  //   { id: 2, name: "Proofreading", status: "Inactive", createdAt: "2023-06-12", parentId: 1 },
  //   { id: 3, name: "Editing", status: "Active", createdAt: "2023-04-20", parentId: null },
  // ];
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [icon, setIcon] = useState(null);

  const [ParentId, setParentId] = useState('');
  const [ParentTitle, setParentTitle] = useState('');
  const [MainId, setMainId] = useState('');
  
  
  const fetchService = async (parentId,title) => {
      try {
        let response = '';
        if(parentId)
        {
          setParentId(parentId)
          setParentTitle(title)
          response  = await axiosConfig.get(`/api/service/all/${parentId}`);
        }
        else
        {
          setParentId('')
          setParentTitle('')
          response = await axiosConfig.get('/api/service/all');
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

    if (isConfirmed && id)
    {
      try {
        const response = await axiosConfig.delete(`/api/service/delete/${id}`)
        //console.log(response);
        
        if(response.status==200)
        {
          setServices(prev => prev.filter(service => service.id !== id));
          toast.success(response.data.message); 
        }
        else
        {
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
    if(service!=null)
    {
      setMainId(service.parentId);
    }
    else
    {
      setMainId('');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingService(null);
    setModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    //console.log(icon);
    
    let filesStr = '';
    if (icon)
    {
      
      
      const formData = new FormData();
      if(editingService)
      {
        formData.append('oldFile', editingService.icon);
      }

      formData.append('files[]', icon);

      const response = await axiosConfig.post(`http://localhost/crapp/upload_crapp_file.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      //console.log(response);
      
      
      //console.log(response.data['files']);

      response.data['files'].forEach((file) => {
        let originalnameFilename = file.originalname;
        if (originalnameFilename === 'image.png') {
          originalnameFilename = `Screenshot_${file.filename}`;
        }
        // if (file.mimetype.startsWith("image/")) {
        // 	filesStr += `<a key={${BASE_URL}/uploads/${file.filename}} href="${BASE_URL}/uploads/${file.filename}" rel="noopener noreferrer" target="_blank"><img src="${BASE_URL}/uploads/${file.filename}" style=" width: 150px" /> </a>||`
        // } else {
        // 	filesStr += `<a key={${BASE_URL}/uploads/${file.filename}} href="${BASE_URL}/uploads/${file.filename}" target="_blank" rel="noopener noreferrer">${originalnameFilename}</a>||`
        // }
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
        icon:filesStr,
        createdAt: editingService?.createdAt || new Date().toISOString().split('T')[0],
      };

      if(editingService.icon!='' && filesStr=='')
      {
        newService.icon  = editingService.icon;
      }

      try {
          const response = await axiosConfig.put(`/api/service/update/${editingService.id}`, newService)
          //console.log(response);
          
          if(response.status==200)
          {
            const newService = {
              id: editingService.id,
              title: form.title.value,
              status: form.status.value,
              parentId: ParentId,
              icon:filesStr,
              createdAt: editingService?.createdAt || new Date().toISOString().split('T')[0],
            };
            if(editingService.icon!='' && filesStr=='')
            {
              newService.icon  = editingService.icon;
            }
            console.log(newService);
            
            setServices(prev => prev.map(s => s.id === editingService.id ? newService : s));
            toast.success(response.data.message); 
          }
          else
          {
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
        parentId: form.parentId.value.trim() || null,
        icon:filesStr
      };
      try {
          const response = await axiosConfig.post('/api/service/add', value)
          //console.log(response);
          
          if(response.status==200 && response.data.insertId)
          {
            const newService = {
              id: response.data.insertId,
              title: form.title.value,
              status: 'Active',
              parentId: form.parentId.value || null,
              icon:filesStr,
              createdAt: editingService?.createdAt || new Date().toISOString().split('T')[0],
            };
            setServices(prev => [...prev, newService]);
            toast.success(response.data.message); 
          }
          else
          {
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
    setMainId('')
    handleCloseModal();
  };

  const mainServices = services.filter(s => s.parentId === null);

  const columns = [
    // { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Service Name', selector: row => row.title, sortable: true,
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {row.status}
        </span>
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
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy HH:mm '), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div>
          
          <button className="text-blue-600 hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit Service'} onClick={() => handleOpenModal(row)}><Pencil size={20} /></button>
          <button className="text-red-600 hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete Service'} onClick={() => handleDelete(row.id)}><Trash size={20} /></button>
          {!row.parentId ? (<button className="text-orange-600 hover:underline text-sm" data-tooltip-id="my-tooltip" data-tooltip-content={'View Sub Service'} onClick={() => fetchService(row.id,row.title)}><Eye size={20} /></button>) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#092e46]">{ParentId ? (`${ParentTitle} - Sub Services`) : 'Main Services'} </h1>
        <div className="flex gap-3">
          {ParentId ? (<button class="bg-[#092e46] text-white px-4 py-1.5 rounded text-sm" data-tooltip-id="my-tooltip" data-tooltip-content={'View Main Service'} onClick={() => fetchService()}><ArrowLeft size={20} /></button>) : <button
            onClick={() => handleOpenModal()}
            data-tooltip-id="my-tooltip"
            data-tooltip-content={'Add Service'}
            className="bg-[#092e46] text-white px-4 py-1.5 rounded text-sm"
          >
            <Plus size={20} />
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
        <div className="fixed inset-0 bg-gray-500/50 bg-opacity-x flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
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
                <label className="block text-sm font-medium">Parent Service</label>
                <select
                  name="parentId"
                  defaultValue={editingService?.parentId || ''}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
                <label className="block text-sm font-medium">Service Icon</label>
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
                <label className="block text-sm font-medium">Service Name</label>
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
                  className="px-4 py-2 text-sm border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
                >
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;
