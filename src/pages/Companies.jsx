import React, { useState, useEffect, useRef } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH, FILE_UPLOAD_URL } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import JoditEditor from 'jodit-react';
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Loader } from "lucide-react";




function Companies() {
  
  const d = new Date();
	const formattedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  const [loader, setLoader] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalViewcompaniesOpen, setViewcompaniesModalOpen] = useState(false);
  const [editingcompanies, setEditingcompanies] = useState(null);
  const [logo, setLogo] = useState(null);
  const editor = useRef(null);
  const [companyAddress, setCompanyAddress] = useState('');

  const fetchcompanies = async () => {
    try {
      const response = await axiosConfig.get('/api/companies/main');
      

      if (response.status === 200) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchcompanies();
  }, []);

  const filteredcompanies = companies.filter(companies =>
    companies.companyTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this Company?');

    if (isConfirmed && id) {
      try {
        const response = await axiosConfig.delete(`/api/companies/delete/${id}`)
        //console.log(response);

        if (response.status == 200) {
          setCompanies(prev => prev.filter(companies => companies.id !== id));
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

  const handleOpenModal = (companies = null) => {
    setEditingcompanies(companies);
    setModalOpen(true);
    if(companies)
    {
      setCompanyAddress(companies.companyAddress)
    }
  };

  const handleCloseModal = () => {
    setEditingcompanies(null);
    setModalOpen(false);
  };

  const handleViewcompaniesModal = (companiesData = null) => {
    setEditingcompanies(companiesData);
    setViewcompaniesModalOpen(true);
  };

  const handleCloseViewcompaniesModal = () => {
    setEditingcompanies(null);
    setViewcompaniesModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    setLoader(true);
    e.preventDefault();
    const form = e.target;
    //console.log(logo);

    let filesStr = '';
    if (logo) {


      const formData = new FormData();
      if (editingcompanies) {
        formData.append('oldFile', editingcompanies.logo);
      }

      formData.append('files[]', logo);

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
    if (editingcompanies) {

      const newcompanies = {
        id: editingcompanies?.id || Date.now(),
        companyTitle: form.companyTitle.value.trim(),
        displayName: form.displayName.value.trim(),
        companyAddress: companyAddress.trim(),
        website: form.website.value.trim(),
        status: form.status.value,
        logo: filesStr,
        createdAt: editingcompanies?.createdAt || formattedDate,
      };

      if (editingcompanies.logo != '' && filesStr == '') {
        newcompanies.logo = editingcompanies.logo;
      }

      try {
        const response = await axiosConfig.put(`/api/companies/update/${editingcompanies.id}`, newcompanies)
        //console.log(response);

        if (response.status == 200) {
          const newcompanies = {
            id: editingcompanies.id,
            companyTitle: form.companyTitle.value,
            displayName: form.displayName.value.trim(),
            companyAddress: companyAddress.trim(),
            website: form.website.value.trim(),
            status: form.status.value,
            logo: filesStr,
            createdAt: editingcompanies?.createdAt || formattedDate,
          };
          if (editingcompanies.logo != '' && filesStr == '') {
            newcompanies.logo = editingcompanies.logo;
          }
          //console.log(newcompanies);

          setCompanies(prev => prev.map(s => s.id === editingcompanies.id ? newcompanies : s));
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
        companyTitle: form.companyTitle.value.trim(),
        displayName: form.displayName.value.trim(),
        companyAddress: companyAddress.trim(),
        website: form.website.value.trim(),
        logo: filesStr
      };
      try {
        const response = await axiosConfig.post('/api/companies/add', value)
        //console.log(response);

        if (response.status == 200 && response.data.insertId) {
          const newcompanies = {
            id: response.data.insertId,
            companyTitle: form.companyTitle.value,
            displayName: form.displayName.value.trim(),
            companyAddress: companyAddress.trim(),
            website: form.website.value.trim(),
            status: 'Active',
            logo: filesStr,
            createdAt: editingcompanies?.createdAt || formattedDate,
          };
          setCompanies(prev => [newcompanies,...prev]);
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

  const columns = [
    // { name: '#', selector: (row, index) => index + 1, width: '60px' },
    {
      name: 'Company Title', selector: row => row.companyTitle, sortable: true,
      cell: row => (
        <div className="flex items-center">
          {/* Check if there is an image */}
          {row.logo ? (
            <img src={`${FILE_PATH}/uploads/${row.logo}`} alt={row.companyTitle} className="w-10 rounded-full mr-2" />
          ) : null}
          <span>{row.companyTitle}</span>
        </div>
      )
    },
    { name: 'Display Name', selector: row => row.displayName, sortable: true},
    
    { name: 'Website', selector: row => row.website, sortable: true},
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
    //       {row.parentId ? `Sub of ID ${row.parentId}` : 'Main companies'}
    //     </span>
    //   ),
    // },
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy hh:mm a'), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div>

          <button className="text-blue-600 px-1 py-[4px] rounded border border-[#3371fc] hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit Company Area'} onClick={() => handleOpenModal(row)}><Pencil size={15} /></button>
          <button className="text-red-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete Company Area'} onClick={() => handleDelete(row.id)}><Trash size={15} /></button>
          <button className="text-orange-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'View Informartion'} onClick={() => handleViewcompaniesModal(row)}><Eye size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 table_header_companies">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]">Company</h1>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal()}
            data-tooltip-id="my-tooltip"
            data-tooltip-content={'Add companies'}
            className="bg-[#f58737] text-white px-2 py-1.5 rounded text-sm cursor-pointer"
          >Add Company
            {/* <Plus size={18} /> */}
          </button>
          <input
            type="text"
            placeholder="Search Company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />



        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredcompanies}
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
              {editingcompanies ? "Edit Company" : "Add Company"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">

              {/* Company Title */}
              <div>
                <label className="block text-sm font-medium pb-1">Company Title</label>
                <input
                  type="text"
                  name="companyTitle"
                  defaultValue={editingcompanies?.companyTitle || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium pb-1">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  defaultValue={editingcompanies?.displayName || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium pb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  defaultValue={editingcompanies?.website || ''}
                  placeholder="https://example.com"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Company Address (Rich Text Editor) */}
              <div>
                <label className="block text-sm font-medium pb-1">Company Address</label>
                {/* You can replace this with a rich text editor like React Quill */}
                <JoditEditor
                  ref={editor}
                  value={companyAddress}
                  config={{
                    readonly: false,
                    toolbarButtonSize: 'small',
                    toolbar: true,
                  }}
                  onBlur={(newContent) => setCompanyAddress(newContent)}
                />
              </div>

              {/* logo Upload */}
              <div>
                <label className="block text-sm font-medium pb-1">Logo</label>
                <input
                  type="file"
                  name="logo"
                  onChange={(e) => setLogo(e.target.files[0])}
                  accept="image/*"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Status Dropdown - Only for Edit Mode */}
              {editingcompanies ? (
                <div>
                  <label className="block text-sm font-medium pb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingcompanies?.status || 'Active'}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              ) : null}

              {/* Form Actions */}
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
                  {editingcompanies ? 'Update' : 'Create'}
                </button>}
              </div>
            </form>
          </div>
        </div>
      )}

      {modalViewcompaniesOpen && (
        <div className="fixed inset-0 bg-gray-500/50 z-50 flex justify-end">
          {/* Side panel */}
          <div className="h-full w-full sm:w-[400px] bg-white shadow-lg p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">View Information</h2>

            <div className="space-y-4">
              {/* Each field as label and value side-by-side */}
              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">CompanyT itle</label>
                <span>{editingcompanies.companyTitle}</span>
              </div>

              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">Display Name</label>
                <span>{editingcompanies.displayName}</span>
              </div>

              

              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">Website</label>
                <span>{editingcompanies.website}</span>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium pb-1">Company Address</label>
                <div dangerouslySetInnerHTML={{ __html: editingcompanies?.companyAddress }} ></div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseViewcompaniesModal}
                  className="px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

      )}

    </div>
  );
}

export default Companies;
