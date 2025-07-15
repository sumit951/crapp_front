import React, { useState, useEffect, useRef } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH, FILE_UPLOAD_URL } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import JoditEditor from 'jodit-react';
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Plus } from "lucide-react";


function Agreements() {
  
  const [companyAddress, setCompanyAddress] = useState('');
  const [serviceProvision, setServiceProvision] = useState('');
  const [termsAndCondition, setTermsAndCondition] = useState('');
  const editor = useRef(null);

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
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchcompanies();
  }, []);

  const [mainServices, setMainServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [ParentId, setParentId] = useState('');
  const [ParentTitle, setParentTitle] = useState('');
  const [SubTitle, setSubTitle] = useState('');

  const [agreements, setAgreements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingagreement, setEditingagreement] = useState(null);

  const [initialPayments, setInitialPayments] = useState(
    editingagreement?.initialPaymentDetails || [{ name: '', amount: '' }]
  );
  const [totalPaymentAmount, setTotalAmount] = useState(0);
  
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

  

  const fetchagreement = async () => {
    try {
      const response = await axiosConfig.get('/api/agreement/main');
      

      if (response.status === 200) {
        setAgreements(response.data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchagreement();
  }, []);

  const filteredagreements = agreements.filter(agreement =>
    agreement.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this Agreement?');

    if (isConfirmed && id) {
      try {
        const response = await axiosConfig.delete(`/api/agreement/delete/${id}`)
        //console.log(response);

        if (response.status == 200) {
          setAgreements(prev => prev.filter(agreement => agreement.id !== id));
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

  const handleOpenModal = (agreementData = null) => {
    const parsedInitialPayments = (() => {
        try {
        if (!agreementData?.initialPaymentDetails) return [];
        return typeof agreementData.initialPaymentDetails === 'string'
            ? JSON.parse(agreementData.initialPaymentDetails)
            : agreementData.initialPaymentDetails;
        } catch (err) {
        console.error("Failed to parse initialPaymentDetails:", err);
        return [];
        }
    })();
    if(agreementData)
    {
        const subservice = [
        {
          "id": agreementData.subService,
          "title": agreementData.subServiceName,
          "parentId": agreementData.mainService,
        }]

        setSubServices(subservice);
        setInitialPayments(parsedInitialPayments);
        setCompanyAddress(agreementData.companyAddress);
        setServiceProvision(agreementData.serviceProvision);
        setTermsAndCondition(agreementData.termsAndCondition);
        setParentTitle(agreementData.mainServiceName)
        setSubTitle(agreementData.subServiceName)
    }
    else
    {
        setSubServices([]);
        setInitialPayments([{ name: '', amount: '' }]);
        setCompanyAddress('');
        setServiceProvision('');
        setTermsAndCondition('');
        setParentTitle('')
        setSubTitle('')
    }
    setEditingagreement(agreementData);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingagreement(null);
    setModalOpen(false);
  };

  

  useEffect(() => {

    const total = initialPayments.reduce((sum, item) => {
        const amount = parseInt(item.amount);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    
    setTotalAmount(total);
  }, [initialPayments]);
  //console.log(totalPaymentAmount);
  //console.log(initialPayments);
  
  const handlePaymentChange = (index, field, value) => {
    const updated = [...initialPayments];
    updated[index][field] = value;
    setInitialPayments(updated);
  };

  const addPaymentRow = () => {
    setInitialPayments([...initialPayments, { name: '', amount: '' }]);
  };

  const removePaymentRow = (index) => {
    const updated = [...initialPayments];
    updated.splice(index, 1);
    setInitialPayments(updated.length ? updated : [{ name: '', amount: '' }]);
  };

  const handleFormSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;

  // Extract all form field values
  const formData = {
    displayName: form.displayName.value.trim(),
    website: form.website.value.trim(),
    topHeading: form.topHeading.value.trim(),
    agreementDate: form.agreementDate.value,
    currency: form.currency.value.trim(),
    initialPaymentDetails: initialPayments,
    totalAmount: parseFloat(form.totalAmount.value || 0),
    startDate: form.startDate.value,
    endDate: form.endDate.value,
    companyId: form.companyId.value,
    mainService: form.mainService.value,
    mainServiceName:ParentTitle,
    subServiceName:SubTitle,
    subService: form.subService.value,
    status: form.status?.value || 'Active',
    companyAddress: companyAddress, // coming from JoditEditor
    serviceProvision: serviceProvision, // coming from JoditEditor
    termsAndCondition: termsAndCondition, // coming from JoditEditor
  };
  //console.log(editingagreement);
  
  if (editingagreement) {
    const updatedAgreement = {
      ...formData,
      id: editingagreement.id,
      createdAt: editingagreement.createdAt || new Date().toISOString().split('T')[0],
    };

    try {
      const response = await axiosConfig.put(`/api/agreement/update/${editingagreement.id}`, updatedAgreement);

      if (response.status === 200) {
        setAgreements(prev =>
          prev.map(s => s.id === editingagreement.id ? updatedAgreement : s)
        );
        toast.success(response.data.message);
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
      console.error(error);
    }
  } else {
    const newAgreement = {
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await axiosConfig.post('/api/agreement/add', newAgreement);

      if (response.status === 200 && response.data.insertId) {
        setAgreements(prev => [
          ...prev,
          { ...newAgreement, id: response.data.insertId }
        ]);
        toast.success(response.data.message);
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
      console.error(error);
    }
  }

  handleCloseModal();
};


  const columns = [
    // { name: '#', selector: (row, index) => index + 1, width: '60px' },
    {name: 'Company name', selector: row => row.displayName, sortable: true},
    {name: 'Main Service', selector: row => row.mainServiceName, sortable: true},
    {name: 'Sub Service', selector: row => row.subServiceName, sortable: true},
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
    //       {row.parentId ? `Sub of ID ${row.parentId}` : 'Main agreement'}
    //     </span>
    //   ),
    // },
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy hh:mm a'), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div>
          <button className="text-blue-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit Agreement'} onClick={() => handleOpenModal(row)}><Pencil size={15} /></button>
          <button className="text-red-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete Agreement'} onClick={() => handleDelete(row.id)}><Trash size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 table_header_agreements">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]">Agreement</h1>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal()}
            data-tooltip-id="my-tooltip"
            data-tooltip-content={'Add agreement'}
            className="bg-[#f58737] text-white px-2 py-1.5 rounded text-sm"
          >Add Agreement
            {/* <Plus size={18} /> */}
          </button>
          <input
            type="text"
            placeholder="Search Agreement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />



        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredagreements}
        pagination
        highlightOnHover
        striped
        responsive
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500/50 bg-opacity-x flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
                {editingagreement ? "Edit Agreement" : "Add Agreement"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">

                {/* Company */}
                <div>
                <label className="block text-sm font-medium pb-1">Company</label>
                <select
                    name="companyId"
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                    onChange={(e) => handleCompanyData(e.target.value)}
                    defaultValue={editingagreement?.companyId || ''}
                >
                    <option value="">Select Company</option>
                    {companies.map(main => (
                    <option key={main.id} value={main.id}>{main.displayName}</option>
                    ))}
                </select>
                </div>

                {/* Display Name */}
                <div>
                <label className="block text-sm font-medium pb-1">Display Name</label>
                <input
                    type="text"
                    name="displayName"
                    defaultValue={editingagreement?.displayName || company?.displayName || ''}
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
                    defaultValue={editingagreement?.website || company?.website || ''}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
                </div>

                {/* Top Heading */}
                <div>
                <label className="block text-sm font-medium pb-1">Top Heading</label>
                <input
                    type="text"
                    name="topHeading"
                    defaultValue={editingagreement?.topHeading || ''}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
                </div>

                {/* Company Address */}
                <div className="flex flex-col">
                <label className="text-sm font-medium pb-1">Company Address</label>
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

                {/* Agreement Date */}
                <div>
                <label className="block text-sm font-medium pb-1">Agreement Date</label>
                <input
                    type="date"
                    name="agreementDate"
                    defaultValue={editingagreement?.agreementDate || ''}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
                </div>

                {/* Main Service */}
                <div>
                <label className="block text-sm font-medium pb-1">Parent Service</label>
                <select
                    name="mainService"
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                    onChange={(e) => fetchService(e.target.value, e.target.options[e.target.selectedIndex].text)}
                    defaultValue={editingagreement?.mainService || ''}
                >
                    <option value="">Main Service</option>
                    {mainServices.map(main => (
                    <option key={main.id} value={main.id}>{main.title}</option>
                    ))}
                </select>
                </div>

                {/* Sub Service */}
                <div>
                <label className="block text-sm font-medium pb-1">Sub Service</label>
                <select
                    name="subService"
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                    onChange={(e) => setSubTitle(e.target.options[e.target.selectedIndex].text)}
                    defaultValue={editingagreement?.subService || ''}
                >
                    <option value="">Sub Service</option>
                    {subServices.map(main => (
                    <option key={main.id} value={main.id}>{main.title}</option>
                    ))}
                </select>
                </div>

                {/* Currency */}
                <div>
                <label className="block text-sm font-medium pb-1">Currency</label>
                <select
                name="currency"
                defaultValue={editingagreement?.currency || 'INR'}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                </select>
                </div>

                {/* Initial Payment Details */}
                <div>
                <label className="block text-sm font-medium pb-1">Initial Payment Details 
                    <button type="button" className="text-green-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 float-end" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete Agreement'} onClick={addPaymentRow}><Plus size={15} /></button>
                </label>
                <div className='clear-both mt-4'>
                {initialPayments.map((payment, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                        type="text"
                        placeholder="Row Name"
                        value={payment.name}
                        onChange={(e) => handlePaymentChange(index, 'name', e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        min="0"
                        value={payment.amount}
                        onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                        className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                        required
                    />
                    <button type="button" className="text-red-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete Agreement'} onClick={() => removePaymentRow(index)}><Trash size={15} /></button>
                    </div>
                ))}
                </div>
                </div>

                {/* Total Amount */}
                <div>
                <label className="block text-sm font-medium pb-1">Total Amount</label>
                <input
                    type="number"
                    name="totalAmount"
                    min="0"
                    value={totalPaymentAmount}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
                </div>

                {/* Start Date */}
                <div>
                <label className="block text-sm font-medium pb-1">Start Date</label>
                <input
                    type="date"
                    name="startDate"
                    defaultValue={editingagreement?.startDate || ''}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
                </div>

                {/* End Date */}
                <div>
                <label className="block text-sm font-medium pb-1">End Date</label>
                <input
                    type="date"
                    name="endDate"
                    defaultValue={editingagreement?.endDate || ''}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
                </div>

                <div className="flex flex-col">
                <label className="text-sm font-medium pb-1">Content below Service Provision</label>
                <JoditEditor
                    ref={editor}
                    value={serviceProvision}
                    config={{
                    readonly: false,
                    toolbarButtonSize: 'small',
                    toolbar: true,
                    }}
                    onBlur={(newContent) => setServiceProvision(newContent)}
                />
                </div>

                <div className="flex flex-col">
                <label className="text-sm font-medium pb-1">Terms & Condition</label>
                <JoditEditor
                    ref={editor}
                    value={termsAndCondition}
                    config={{
                    readonly: false,
                    toolbarButtonSize: 'small',
                    toolbar: true,
                    }}
                    onBlur={(newContent) => setTermsAndCondition(newContent)}
                />
                </div>

                {/* Status (only on edit) */}
                {editingagreement && (
                <div>
                    <label className="block text-sm font-medium pb-1">Status</label>
                    <select
                    name="status"
                    defaultValue={editingagreement?.status || 'Active'}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    </select>
                </div>
                )}

                {/* Buttons */}
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
                    className="px-4 py-2 text-sm bg-[#f58737] text-white rounded"
                >
                    {editingagreement ? 'Update' : 'Create'}
                </button>
                </div>
            </form>
            </div>
        </div>
        )}

    </div>
  );
}

export default Agreements;
