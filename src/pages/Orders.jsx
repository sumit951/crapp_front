import React, { useState, useEffect } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { Eye, ArrowDown, ArrowBigDownIcon, ArrowBigDown } from "lucide-react";




function Orders() {

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingorder, setEditingorder] = useState(null);

  //console.log(alluserdata);
  const fetchorder = async () => {
    try {
      const response = await axiosConfig.get('/api/order/all');

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (editingorder) {

      const neworder = {
        id: editingorder?.id || Date.now(),
        status: form.status.value,
        createdAt: editingorder?.createdAt || new Date().toISOString().split('T')[0],
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
            createdAt: editingorder?.createdAt || new Date().toISOString().split('T')[0],
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
      //       createdAt: editingorder?.createdAt || new Date().toISOString().split('T')[0],
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

    }

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

        <button className="text-blue-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'View order'} onClick={() => handleOpenModal(row)}><Eye size={15} /></button>

        {/* <button className="text-red-600 hover:underline text-sm mr-3" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete order'} onClick={() => handleDelete(row.id)}><Trash size={15} /></button> */}

        </div>
      ),
    },
  ];

  return (
    <div className="p-6 table_header_orders">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]">Orders</h1>
        <div className="flex gap-3">
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
                  <div class="clear-both"></div>
                  {editingorder.status !== 'Completed' && (
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-[#f58737] text-white rounded hover:bg-[#d9742d] transition"
                    >
                      {editingorder ? 'Update' : 'Create'}
                    </button>
                  )}
                  
                </div>
              </form>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default Orders;
