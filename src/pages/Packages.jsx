import React, { useState, useEffect } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Loader } from "lucide-react";




function Packages() {

  const d = new Date();
	const formattedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  const [loader, setLoader] = useState(false);

  const [mainServices, setMainServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [packages, setpackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalViewpackageOpen, setViewpackageModalOpen] = useState(false);
  const [editingpackage, setEditingpackage] = useState(null);

  const [ParentId, setParentId] = useState('');
  const [ParentTitle, setParentTitle] = useState('');
  const [SubTitle, setSubTitle] = useState('');

  const fetchService = async (parentId, title) => {

    try {
      let response = '';
      if (parentId) {
        setParentId(parentId)
        setParentTitle(title)
        response = await axiosConfig.get(`/api/service/sub/${parentId}`);
        if (response.status === 200) {
          setSubServices(response.data.data);
        }
      }
      else {
        setParentId('')
        setParentTitle('')
        response = await axiosConfig.get('/api/service/main');
        if (response.status === 200) {
          setMainServices(response.data.data);
        }
      }



    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchService();
  }, []);

  //console.log(alluserdata);
  const fetchpackage = async () => {
    try {
      const response = await axiosConfig.get('/api/package/all');

      if (response.status === 200) {
        setpackages(response.data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchpackage();
  }, []);

  const filteredpackages = packages.filter(packageData =>
    packageData.packageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    packageData.subServiceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    packageData.mainServiceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this package?');

    if (isConfirmed && id) {
      try {
        const response = await axiosConfig.delete(`/api/package/delete/${id}`)
        //console.log(response);

        if (response.status == 200) {
          setpackages(prev => prev.filter(packageData => packageData.id !== id));
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

  const handleOpenModal = (packageData = null) => {
    //console.log(packageData);

    if (packageData) {
      const subservice = [
        {
          "id": packageData.subService,
          "title": packageData.subServiceName,
          "parentId": packageData.mainService,
        }]

      setSubServices(subservice);
    }

    setEditingpackage(packageData);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingpackage(null);
    setModalOpen(false);
  };

  const handleViewpackageModal = (packageData = null) => {
    setEditingpackage(packageData);
    setViewpackageModalOpen(true);
  };

  const handleCloseViewpackageModal = () => {
    setEditingpackage(null);
    setViewpackageModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    setLoader(true);
    e.preventDefault();
    const form = e.target;
    if (editingpackage) {

      const newpackage = {
        id: editingpackage?.id || Date.now(),
        packageTitle: form.packageTitle.value,
        mainService: form.mainService.value.trim(),
        subService: form.subService.value.trim(),
        numberOfPages: form.numberOfPages.value.trim(),
        expectedDeliveryDate: form.expectedDeliveryDate.value.trim(),
        revisions: form.revisions.value.trim(),
        amountINR: form.amountINR.value.trim(),
        amountUSD: form.amountUSD.value.trim(),
        status: form.status.value,
        createdAt: editingpackage?.createdAt || formattedDate,
      };


      try {
        const response = await axiosConfig.put(`/api/package/update/${editingpackage.id}`, newpackage)
        //console.log(response);

        if (response.status == 200) {
          console.log(editingpackage);

          const newpackage = {
            id: editingpackage.id,
            packageTitle: editingpackage.packageTitle,
            mainService: editingpackage.mainService,
            subService: editingpackage.subService,
            mainServiceName: editingpackage.mainServiceName,
            subServiceName: editingpackage.subServiceName,
            numberOfPages: form.numberOfPages.value.trim(),
            expectedDeliveryDate: form.expectedDeliveryDate.value.trim(),
            revisions: form.revisions.value.trim(),
            amountINR: form.amountINR.value.trim(),
            amountUSD: form.amountUSD.value.trim(),
            status: form.status.value,
            createdAt: editingpackage?.createdAt || formattedDate,
          };

          //console.log(newpackage);

          setpackages(prev => prev.map(s => s.id === editingpackage.id ? newpackage : s));
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
        packageTitle: form.packageTitle.value,
        mainService: form.mainService.value.trim(),
        subService: form.subService.value.trim(),
        numberOfPages: form.numberOfPages.value.trim(),
        expectedDeliveryDate: form.expectedDeliveryDate.value.trim(),
        revisions: form.revisions.value.trim(),
        amountINR: form.amountINR.value.trim(),
        amountUSD: form.amountUSD.value.trim(),
      };
      try {
        const response = await axiosConfig.post('/api/package/add', value)
        //console.log(response);

        if (response.status == 200 && response.data.insertId) {
          const newpackage = {
            id: response.data.insertId,
            packageTitle: form.packageTitle.value.trim(),
            mainService: form.mainService.value.trim(),
            subService: form.subService.value.trim(),
            mainServiceName: ParentTitle,
            subServiceName: SubTitle,
            numberOfPages: form.numberOfPages.value.trim(),
            expectedDeliveryDate: form.expectedDeliveryDate.value.trim(),
            revisions: form.revisions.value.trim(),
            amountINR: form.amountINR.value.trim(),
            amountUSD: form.amountUSD.value.trim(),
            status: 'Active',
            createdAt: editingpackage?.createdAt || formattedDate,
          };

          console.log(newpackage);

          setpackages(prev => [newpackage,...prev]);
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
    { name: 'Package Title', selector: row => row.packageTitle, sortable: true },
    { name: 'Main Service', selector: row => row.mainServiceName, sortable: true },
    { name: 'Sub Service', selector: row => row.subServiceName, sortable: true },
    {
      name: 'Status',
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
          {row.status}
        </span>
      ),
    },
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy hh:mm a'), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div>

          <button className="text-blue-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit Package'} onClick={() => handleOpenModal(row)}><Pencil size={15} /></button>

          <button className="text-red-600 px-1 py-[4px] rounded border hover:underline text-sm cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete Package'} onClick={() => handleDelete(row.id)}><Trash size={15} /></button>
          
          <button className="text-orange-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'View Package Informartion'} onClick={() => handleViewpackageModal(row)}><Eye size={15} /></button>

        </div>
      ),
    },
  ];

  return (
    <div className="p-6 table_header_packages">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]">Packages</h1>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal()}
            data-tooltip-id="my-tooltip"
            data-tooltip-content={'Add Package'}
            className="bg-[#f58737] text-white px-2 py-1.5 rounded text-sm cursor-pointer"
          >Add Package
            {/* <Plus size={20} /> */}
          </button>
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />



        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredpackages}
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
              {editingpackage ? "Edit Package" : "Add Package"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium pb-1">Package Title</label>
                <input
                  type="text"
                  name="packageTitle"
                  defaultValue={editingpackage?.packageTitle || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium pb-1">Parent Service</label>
                <select
                  name="mainService"
                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                  onChange={(e) => fetchService(e.target.value, e.target.options[e.target.selectedIndex].text)}
                  defaultValue={editingpackage?.mainService || ''}
                >
                  <option value="">Main Service</option>
                  {mainServices.map(main => (
                    <option key={main.id} value={main.id}>
                      {main.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium pb-1">Sub Service</label>
                <select
                  name="subService"
                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                  onChange={(e) => setSubTitle(e.target.options[e.target.selectedIndex].text)}
                  defaultValue={editingpackage?.subService || ''}
                >
                  <option value="">Sub Service</option>
                  {subServices.map(main => (
                    <option key={main.id} value={main.id}>
                      {main.title}
                    </option>
                  ))}
                </select>
              </div>

              {editingpackage ? <div>
                <label className="block text-sm font-medium pb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingpackage?.status || 'Active'}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
                :
                null
              }


              <div>
                <label className="block text-sm font-medium pb-1">No of Pages</label>
                <input
                  type="text"
                  name="numberOfPages"
                  defaultValue={editingpackage?.numberOfPages || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium pb-1">Expected Delivery Date (Days)</label>
                <input
                  type="number"
                  min="1"
                  name="expectedDeliveryDate"
                  defaultValue={editingpackage?.expectedDeliveryDate || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  onInput={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (value > 60) {
                      e.target.value = 60;
                    } else if (value < 1) {
                      e.target.value = 1;
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium pb-1">Revisions</label>
                <input
                  type="text"
                  name="revisions"
                  defaultValue={editingpackage?.revisions || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium pb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  name="amountINR"
                  defaultValue={editingpackage?.amountINR || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  onInput={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (value > 100000) {
                      e.target.value = 100000;
                    } else if (value < 1) {
                      e.target.value = 1;
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium pb-1">Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  name="amountUSD"
                  defaultValue={editingpackage?.amountUSD || ''}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  onInput={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (value > 1000) {
                      e.target.value = 1000;
                    } else if (value < 1) {
                      e.target.value = 1;
                    }
                  }}
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
                  {editingpackage ? 'Update' : 'Create'}
                </button>}
              </div>
            </form>
          </div>
        </div>
      )}

      {modalViewpackageOpen && (
        <div className="fixed inset-0 bg-gray-500/50 z-50 flex justify-end">
          {/* Side panel */}
          <div className="h-full w-full sm:w-[400px] bg-white shadow-lg p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">View Package Information</h2>

            <div className="space-y-4">
              {/* Each field as label and value side-by-side */}
              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">Parent Service</label>
                <span>{editingpackage.mainServiceName}</span>
              </div>

              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">Sub Service</label>
                <span>{editingpackage.subServiceName}</span>
              </div>

              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">No of Pages</label>
                <span>{editingpackage.numberOfPages}</span>
              </div>

              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">Expected Delivery {`Day(s) : ${editingpackage.expectedDeliveryDate}`}</label>
                <span>
                  {editingpackage.expectedDeliveryDate
                    ? new Date(Date.now() + editingpackage.expectedDeliveryDate * 24 * 60 * 60 * 1000).toDateString()
                    : "N/A"}


                </span>
              </div>


              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">Revisions</label>
                <span>{editingpackage.revisions}</span>
              </div>

              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">Amount (₹)</label>
                <span>{editingpackage.amountINR}</span>
              </div>
              <div className="flex justify-between">
                <label className="text-sm font-medium pb-1">Amount ($)</label>
                <span>{editingpackage.amountUSD}</span>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseViewpackageModal}
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

export default Packages;
