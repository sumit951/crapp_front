import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import JoditEditor from 'jodit-react';
import { format } from 'date-fns';
import { Eye, ArrowDown, ArrowBigDownIcon, ArrowBigDown, Loader, ArrowRight, ArrowLeft, SignatureIcon, View, Cross, X } from "lucide-react";
import logo from '../assets/logo.png';

function Orders() {

  const d = new Date();
	const formattedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  const [loader, setLoader] = useState(false);

  const { userId } = useParams();

  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  
  const [postalAddress, setPostalAddress] = useState('');
  const editor = useRef(null);
  
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenNDA, setModalOpenNDA] = useState(false);
  const [editingorder, setEditingorder] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState();
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

  const handleCompanyData = async (companyId) => {
    try {
      const response = await axiosConfig.get(`/api/companies/getcompanyInfo/${companyId}`);
      

      if (response.status === 200) {
        setCompany(response.data.data);
        setCompanyAddress(response.data.data.companyAddress)
        setCompanyName(response.data.data.displayName)
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchcompanies();
  }, []);


  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axiosConfig.get(
          'https://restcountries.com/v3.1/all?fields=name,idd'
        );
        const countryData = res.data
          .filter((c) => c.idd?.root) // Only countries with a calling code
          .map((c) => ({
            name: c.name.common,
            code: `${c.idd.root}${c.idd.suffixes ? c.idd.suffixes[0] : ''}`,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(countryData);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = (e) => {
    const selected = countries.find((c) => c.name === e.target.value);
    setSelectedCountry(selected.name);
    setCountryCode(selected.code);
  };

  const [previewData, setPreviewData] = useState(null);
  const [modalOpenPreview, setModalOpenPreview] = useState(false);

  const handlePreview = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Add any extra data that isn't in the form, e.g. editor content, phone, countryCode etc:
    data.companyAddress = companyAddress; // from JoditEditor state
    data.postalAddress = postalAddress;   // from JoditEditor state
    data.phone = phone;
    data.countryCode = countryCode;
    data.selectedCountry = selectedCountry;
    data.companyName = companyName;
    data.orderNo = editingorder.orderNo;
    data.orderId = editingorder.id;
    data.userId = editingorder.userId;
    setPreviewData(data);
    setModalOpenPreview(true);
  };

  const handleFullPreview = (data) => {
    setPreviewData(data);
    setModalOpenPreview(true);
  };

  //console.log(alluserdata);
  const fetchorder = async () => {
    let orderUserId = '';
    if(userId)
    {
      orderUserId = userId
    }
      try {
      const response = await axiosConfig.get(`/api/order/all/${orderUserId}`);

      if (response.status === 200) {
        setOrders(response.data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchorder();
  }, []);

  const filteredorders = orders.filter(orderData =>
    orderData.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this order?');

    if (isConfirmed && id) {
      try {
        const response = await axiosConfig.delete(`/api/order/delete/${id}`)
        //console.log(response);

        if (response.status == 200) {
          setOrders(prev => prev.filter(orderData => orderData.id !== id));
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

  const handleOpenModal = (orderData = null) => {
    //console.log(orderData);
    setEditingorder(orderData);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingorder(null);
    setModalOpen(false);
  };

  const handleOpenModalNDA = (orderData = null) => {
    //console.log(orderData);
    setEditingorder(orderData);
    setModalOpenNDA(true);
  };

  const handleCloseModalNDA = () => {
    setEditingorder(null);
    setModalOpenNDA(false);
  };

  const handleFormSubmit = async (e) => {
    setLoader(true);
    e.preventDefault();
    const form = e.target;
    if (editingorder) {

      const neworder = {
        id: editingorder?.id || Date.now(),
        status: form.status.value,
        createdAt: editingorder?.createdAt || formattedDate,
      };


      try {
        const response = await axiosConfig.put(`/api/order/update/${editingorder.id}`, neworder)
        //console.log(response);

        if (response.status == 200) {
          console.log(editingorder);

          const neworder = {
            id: editingorder.id,
            orderNo: editingorder.orderNo.trim(),
            firstName: editingorder.firstName.trim(),
            lastName: editingorder.lastName.trim(),
            email: editingorder.email.trim(),
            mobile: editingorder.mobile.trim(),
            country: editingorder.country.trim(),
            uploadFile: editingorder.uploadFile.trim(),
            notes: editingorder.notes.trim(),
            citation: editingorder.citation.trim(),
            instructions: editingorder.instructions.trim(),
            currency: editingorder.currency.trim(),
            amount: editingorder.amount,
            orderInfo: editingorder.orderInfo,
            status: form.status.value,
            createdAt: editingorder?.createdAt || formattedDate,
          };

          //console.log(neworder);

          setOrders(prev => prev.map(s => s.id === editingorder.id ? neworder : s));
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
      // const value = {
      //   numberOfPages: form.numberOfPages.value.trim(),
      //   expectedDeliveryDate: form.expectedDeliveryDate.value.trim(),
      //   revisions: form.revisions.value.trim(),
      //   amountINR: form.amountINR.value.trim(),
      //   amountUSD: form.amountUSD.value.trim(),
      // };
      // try {
      //   const response = await axiosConfig.post('/api/order/add', value)
      //   //console.log(response);

      //   if (response.status == 200 && response.data.insertId) {
      //     const neworder = {
      //       id: response.data.insertId,
      //       numberOfPages: form.numberOfPages.value.trim(),
      //       expectedDeliveryDate: form.expectedDeliveryDate.value.trim(),
      //       revisions: form.revisions.value.trim(),
      //       amountINR: form.amountINR.value.trim(),
      //       amountUSD: form.amountUSD.value.trim(),
      //       status: 'Active',
      //       createdAt: editingorder?.createdAt || formattedDate,
      //     };

      //     console.log(neworder);

      //     setOrders(prev => [...prev, neworder]);
      //     toast.success(response.data.message);
      //   }
      //   else {
      //     toast.success(response.data.message);
      //   }
      // } catch (error) {
      //   // Handle known server response
      //   if (error.response && error.response.data && error.response.data.message) {
      //     toast.error(error.response.data.message);
      //   } else {
      //     // Fallback error
      //     toast.error('Something went wrong');
      //   }

      //   console.log(error); // Optional: full error logging for debugging
      // }
      setLoader(false);
    }

    handleCloseModal();
  };

  const handleSaveNDA = async (e) => {
    setLoader(true);
    e.preventDefault();
    // console.log(previewData);
    // return false;
    const confirmed = window.confirm("Are you sure you want to submit this NDA?");
    if (!confirmed) return;

    try {
      const response = await axiosConfig.post('/api/order/addnda', previewData)
      //console.log(response);

      if (response.status == 200 && response.data.insertId) {
        toast.success(response.data.message);
        location.reload();
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
    handleCloseModal();
  };


  const columns = [
    // { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Order No.', selector: row => row.orderNo, sortable: true },
    { name: 'First Name', selector: row => row.firstName, sortable: true },
    { name: 'Last Name', selector: row => row.lastName, sortable: true },
    {
      name: 'Status',
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.status === "Pending"
        ? "bg-red-100 text-red-700"           // danger
        : row.status === "In Progress"
        ? "bg-yellow-100 text-yellow-700"     // warning
        : row.status === "Completed"
        ? "bg-green-100 text-green-700"       // success
        : "bg-gray-100 text-gray-700"         // default/fallback
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

        <button className="text-blue-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'View order'} onClick={() => handleOpenModal(row)}><Eye size={15} /></button>

         {!row.ndaId ? (<button className="text-orange-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Create NDA'} onClick={() => handleOpenModalNDA(row)}><SignatureIcon size={15} /></button>) : (<button className="text-orange-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Preview NDA'} onClick={() => handleFullPreview(row)}><View size={15} /></button>)}
        

        {/* <button className="text-red-600 hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete order'} onClick={() => handleDelete(row.id)}><Trash size={15} /></button> */}

        </div>
      ),
    },
  ];

  return (
    <div className="p-6 table_header_orders">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]">Orders</h1>
        <div className="flex gap-3">
          {userId &&<Link 
            to="/users"
            className="bg-[#f58737] text-white px-2 py-1.5 rounded text-sm cursor-pointer" 
            data-tooltip-id="my-tooltip" data-tooltip-content={'Back to user'}
          >
            <ArrowLeft size={18} />
          </Link>}
          <input
            type="text"
            placeholder="Search Orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredorders}
        pagination
        highlightOnHover
        striped
        responsive
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-6xl">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">
              {editingorder ? "View Order Information" : "Add Order"}
            </h2>

            {/* Equal Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Section: Order Details */}
              <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                <h3 className="text-md font-semibold mb-2">Order Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="font-medium">Order ID</div>
                  <div>{editingorder.orderNo}</div>

                  <div className="font-medium">Name</div>
                  <div>{editingorder.firstName} {editingorder.lastName}</div>

                  <div className="font-medium">Email</div>
                  <div>{editingorder.email}</div>

                  <div className="font-medium">Mobile</div>
                  <div>{editingorder.mobile}</div>

                  <div className="font-medium">Country</div>
                  <div>{editingorder.country}</div>

                  <div className="font-medium">Notes</div>
                  <div>{editingorder.notes}</div>

                  <div className="font-medium">Citation</div>
                  <div>{editingorder.notes}</div>

                  <div className="font-medium">Instructions</div>
                  <div>{editingorder.instructions}</div>

                  <div className="font-medium">Amount ({editingorder.currency})</div>
                  <div>{editingorder.amount}</div>

                  <div className="font-medium">Current Status</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      editingorder.status === "Pending"
                        ? "bg-red-100 text-red-700"
                        : editingorder.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : editingorder.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {editingorder.status}
                    </span>
                  </div>

                  <div className="font-medium">Uploaded File</div>
                  <div>
                    <a
                      href={`${FILE_PATH}/orders/${editingorder.uploadFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition"
                    >
                      View <ArrowBigDown size={18} className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Section: Order Package Summary */}
              <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                <h3 className="text-md font-semibold mb-2">Order Package Summary</h3>
                {editingorder.orderInfo.map((rowOrder) => (
                  <div key={rowOrder.id} className="space-y-2 text-sm border-b pb-3 last:border-none">
                    <div className="flex justify-between"><span>Service Type:</span><span>{rowOrder.pacakgeId}</span></div>
                    <div className="flex justify-between"><span>Deadline:</span><span>{rowOrder.deadline}</span></div>
                    <div className="flex justify-between"><span>Word Count / Pages:</span><span>{rowOrder.numberOfPages}</span></div>
                    <div className="flex justify-between"><span>Amount ({editingorder.currency}):</span><span>{rowOrder.packageAmount}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Form and Actions */}
            <div className="flex justify-end pt-6">
              <form onSubmit={handleFormSubmit} className="space-y-4 w-full md:flex md:items-end md:gap-4">
                {editingorder.status !== 'Completed' && (
                  <div className="w-full md:w-64">
                    <label className="block text-sm font-medium pb-1">Update Status</label>
                    <select
                      name="status"
                      defaultValue={editingorder?.status || 'In Progress'}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  
                )}
                
                <div className="flex gap-2 pt-2">
                  <div className="clear-both"></div>
                  {editingorder.status !== 'Completed' && (
                      loader ? (
                        <Loader className="animate-spin h-6 w-6 text-gray-500" />
                      ) : (
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm bg-[#f58737] text-white rounded hover:bg-[#d9742d] transition cursor-pointer"
                        >
                          {editingorder ? 'Update' : 'Create'}
                        </button>
                      )
                    )}

                  
                </div>
              </form>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* NDA Modal */}
      {modalOpenNDA && (
        <div className="fixed inset-0 bg-gray-500/50 z-50 flex justify-end">
          {/* Side panel */}
          <div className="h-full w-full sm:w-[82%] bg-white shadow-lg p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
                Add New  NDA
            </h2>
            <form onSubmit={handlePreview} className="space-y-4">


              {/* Two-column layout */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Left box */}
                
                <div className="flex-1 border border-gray-200 rounded p-4 space-y-4">
                                <h2 className="text-lg font-semibold mb-4">
                Detail of person receiving confidential information (Recipient)
              </h2>
                  <div>
                    <label className="block text-sm font-medium pb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullNameCrm"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium pb-1">Company</label>
                    <select
                      name="companyId"
                      className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                      onChange={(e) => handleCompanyData(e.target.value)}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((main) => (
                        <option key={main.id} value={main.id}>
                          {main.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium pb-1">Website</label>
                    <input
                      type="url"
                      name="website"
                      defaultValue={company?.website || ''}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium pb-1">NDA Title</label>
                    <input
                      type="text"
                      name="ndaTitle"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    />
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium pb-1">Company Address</label>
                    <JoditEditor
                      ref={editor}
                      value={companyAddress}
                      config={{
                        readonly: false,
                        toolbarButtonSize: 'small',
                        toolbar: true,
                      }}
                      onBlur={(newContent) => setCompanyAddress(newContent)}
                      required
                    />
                  </div>
                </div>

                {/* Right box */}
                
                <div className="flex-1 border border-gray-200 rounded p-4 space-y-4">
                  <h2 className="text-lg font-semibold mb-4">
                    Detail of person receiving confidential information (Discloser)
                  </h2>
                  <div>
                    <label className="block text-sm font-medium pb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullNameClient"
                      defaultValue={`${editingorder.firstName} ${editingorder.lastName}`}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium pb-1">Email</label>
                    <input
                      type="text"
                      name="emailClient"
                      defaultValue={`${editingorder.email}`}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium pb-1">Country</label>
                    <select
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.name} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Country Code + Phone */}
                  <div>
                    <label className="block text-sm font-medium pb-1">Phone Number</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={countryCode}
                        readOnly
                        className="w-20 border border-gray-300 rounded px-2 py-2 text-sm bg-gray-100"
                        required
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium pb-1">Postal Address</label>
                    <JoditEditor
                      ref={editor}
                      value={postalAddress}
                      config={{
                        readonly: false,
                        toolbarButtonSize: 'small',
                        toolbar: true,
                      }}
                      onBlur={(newContent) => setPostalAddress(newContent)}
                      required
                    />
                  </div>

                  {/* Buttons - only on right box */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModalNDA}
                      className="px-4 py-2 text-sm border border-gray-300 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-[#f58737] text-white rounded cursor-pointer"
                      >
                        Preview
                    </button>
                    
                  </div>
                </div>
              </div>
            </form>

            </div>
        </div>
      )}

      {/* Preview NDA Modal */}
      {modalOpenPreview && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="relative h-full w-full bg-white rounded-lg shadow-lg p-6 max-w-6xl overflow-y-auto">
            <div className="relative mb-4">
              {/* Close Button - floats outside top-right */}
              <button
                onClick={() => setModalOpenPreview(false)}
                className="absolute -top-3 -right-3 p-1 bg-white border border-gray-300 rounded-full shadow hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={15} className="text-red-500" />
              </button>

              {/* Header Box */}
              <div className="border border-gray-300 rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="logo">
                    <img src={logo} alt="logo" />
                  </div>
                  <div className="text-xs font-semibold text-red-600">
                    Reference ID : NDA/{previewData?.orderNo || "N/A"}
                  </div>
                </div>
              </div>
            </div>




            {/* Title */}
            <h2 className="text-center text-sm font-bold uppercase text-gray-900 border-b border-gray-400 pb-2 mb-4">
              NON-DISCLOSURE AGREEMENT BETWEEN {previewData?.companyName || "N/A"} AND {previewData?.fullNameClient || "N/A"}
            </h2>

            {/* Client Details */}
            <div className="mb-4 space-y-1 text-[13px]">
              <p><span className="font-bold1">Name : </span> {previewData?.fullNameCrm || "N/A"}</p>
              <p>
                <span className="font-bold1">Website : </span>
                <a href={previewData?.website || "#"} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                  {previewData?.website || "N/A"}
                </a>
              </p>
              <p><span className="font-bold1">Company name : </span> {previewData?.companyName || "N/A"}</p>
              <p>
                <span className="font-bold1">Company address : </span>
              </p>
              <div className="pl-3" dangerouslySetInnerHTML={{ __html: previewData?.companyAddress || "N/A" }} />
              
            </div>

            <hr className="my-4" />

            {/* NDA Text */}
            <div className="text-justify text-[13px] space-y-3 leading-relaxed">
              <p>
                This is a Non-Disclosure Agreement (the “NDA”) between
                <strong> "{previewData?.fullNameClient || 'N/A'}"</strong> and
                <strong> "{previewData?.companyName || 'N/A'}"</strong> which is entered into between the Client and the Company in consideration of the Client retaining the Company for the performance of services (the “Services”) for the benefit of the Client.
              </p>

              <p className="font-bold">
                The Client and the Company, each separately, is a Party (“a Party”) to this NDA and collectively are herein referred to as the Parties (the “Parties”).
              </p>

              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  The effective date of this Agreement is the date on which the Parties have entered into an agreement for the Services either orally or in writing or evidenced through payments.
                </li>
                <li>
                  The Company acknowledges and agrees that in connection with the Services, the Client may disclose to the Company information, including, but not necessarily limited to:
                  <ul className="list-disc ml-6 mt-1">
                    <li>
                      Methods, ideas, business secrets, processes, formulae, compositions, systems, techniques, inventions, machines, computer programs and research projects, and raw data.
                    </li>
                  </ul>
                </li>
                <li>
                  The Company agrees to keep confidential all the information described in Clause 2 herein and shall not disclose said information to any person or persons, real or juridical, other than as may be required to enforce a Party’s rights in the resolution of any dispute between the Parties.
                </li>
                <li>
                  After completion of the Services, the Company shall continue to keep confidential all the information described in Clause 2 herein. The Company may keep its obligations of confidentiality as set forth in the NDA by returning all Client materials to the Client or by destruction of such materials after a six (6) month period following the completion of the Services.
                </li>
              </ol>
            </div>

            {/* Signed By Section */}
            <div className="mt-6 pt-4 text-[13px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Signed Info Table */}
                <div className="w-full max-w-md text-sm">
                  <h3 className="text-red-600 font-bold mb-2">Signed By</h3>
                  <div className="w-full border border-gray-300 rounded p-4 text-sm space-y-2 bg-gray-50">
                    <p><span className="font-semibold1">Name</span> : {previewData?.fullNameClient || "N/A"}</p>
                    <p><span className="font-semibold1">Email ID</span> : {previewData?.emailClient || "N/A"}</p>
                    <p><span className="font-semibold1">Country</span> : {previewData?.selectedCountry || "N/A"}</p>
                    <p><span className="font-semibold1">Phone No</span> : {previewData?.countryCode || ""} {previewData?.phone || ""}</p>
                    <p><span className="font-semibold1">Postal Address</span> : </p>
                    <div className="pl-3" dangerouslySetInnerHTML={{ __html: previewData?.postalAddress || "N/A" }} />
                    <p><span className="font-semibold1">IP Address</span> : {previewData?.ipAddress || "N/A"}</p>
                  </div>
                </div>

                {/* Signature Area */}
                <div className="w-full">
                  <p className="text-sm font-semibold text-end mb-3">
                    Signed this :{" "}
                    <span className="text-red-600">
                      {new Date().toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </p>

                  {/* Signature Buttons */}
                  <div className="flex gap-2 justify-between mb-3">
                    <button className="text-black">
                      Draw Your Signature
                    </button>
                    <button className="text-red-600 text-xs border border-red-500 px-2 py-1 rounded hover:bg-red-100">
                      Clear
                    </button>
                  </div>

                  {/* Signature Box */}
                  <div className="border border-gray-300 h-28 mb-4 bg-gray-50"></div>

                  {/* Footer Buttons */}
                  {!previewData.ndaId && <div className="flex flex-col md:flex-row justify-end gap-4 mt-2">
                    <button
                      onClick={() => setModalOpenPreview(false)}
                      className="bg-red-600 text-white px-4 py-1 text-sm rounded hover:bg-red-700"
                    >
                      Go back
                    </button>
                    {loader && <Loader className="animate-spin h-6 w-6 text-gray-500" />}
                    {!loader && (<button
                      onClick={handleSaveNDA}
                      className="bg-green-600 text-white px-4 py-1 text-sm rounded hover:bg-green-700"
                    >
                      Save NDA
                    </button>
                    )}
                  </div>}
                </div>
              </div>

              <p className="text-center text-xs text-gray-600 mt-6">
                All Rights Reserved, Chanakya, (c) Copyright 2010 - 2024.
              </p>
            </div>
          </div>
        </div>
      )}





    </div>
  );
}

export default Orders;
