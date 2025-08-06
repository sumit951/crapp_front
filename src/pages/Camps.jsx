import React, { useState, useEffect, useRef } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Loader } from "lucide-react";
import Campbooking from "../pages/Campbooking";

import Select from 'react-select';
import Tags from "@yaireo/tagify/dist/react.tagify";
import "@yaireo/tagify/dist/tagify.css";



function Camps() {

  const d = new Date();
  const formattedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  const [loader, setLoader] = useState(false);

  const [locations, setLocations] = useState([]);
  

  const [camps, setCamps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalViewcampOpen, setViewcampModalOpen] = useState(false);
  const [modalViewcampOpenbooking, setViewcampModalOpenbooking] = useState(false);
  const [editingcamp, setEditingcamp] = useState(null);
  const [editingcampbooking, setEditingcampbooking] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(editingcamp?.campLocation || '');
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeSlotsDaytwo, setTimeSlotsDaytwo] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const tagifyRef = useRef();
  const [EditslotSts, setEditslotSts] = useState(false);

  const onChangeTags = (e) => {
    const parsed = JSON.parse(e.detail.value || '[]');
    setKeywords(parsed.map(tag => tag.value));
  };

  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [invalidTime, setInvalidTime] = useState(false);

  const handleFromTimeChange = (e) => {
    const value = e.target.value;
    setFromTime(value);
    // validate if TO already selected
    if (toTime && value >= toTime) {
      setInvalidTime(true);
      setFromTime('');
    } else {
      setInvalidTime(false);
    }
  };

  const handleToTimeChange = (e) => {
    const value = e.target.value;
    setToTime(value);
    if (fromTime && value <= fromTime) {
      setInvalidTime(true);
      setToTime('')
    } else {
      setInvalidTime(false);
    }
  };


  const [fromTimeDaytwo, setFromTimeDaytwo] = useState('');
  const [toTimeDaytwo, setToTimeDaytwo] = useState('');
  const [invalidTimeDaytwo, setInvalidTimeDaytwo] = useState(false);

  const handleFromTimeChangeDaytwo = (e) => {
    const value = e.target.value;
    setFromTimeDaytwo(value);
    // validate if TO already selected
    if (toTimeDaytwo && value >= toTimeDaytwo) {
      setInvalidTimeDaytwo(true);
      setFromTimeDaytwo('');
    } else {
      setInvalidTimeDaytwo(false);
    }
  };

  const handleToTimeChangeDaytwo = (e) => {
    const value = e.target.value;
    setToTimeDaytwo(value);
    if (fromTimeDaytwo && value <= fromTimeDaytwo) {
      setInvalidTimeDaytwo(true);
      setToTimeDaytwo('')
    } else {
      setInvalidTimeDaytwo(false);
    }
  };

  const fetchLocation = async () => {
    try {
        const response = await axiosConfig.get('/api/camp/location');
        if (response.status === 200)
        {
          const formatted = response.data.data.map(loc => ({
              value: loc.name,
              label: loc.name,
          }));
          setLocations(formatted);
        }
    } catch (error) {
        toast.error(error.message);
    }
    };

  useEffect(() => {
  fetchLocation();
  }, []);

  useEffect(() => {
    if (editingcamp?.campLocation && locations.length > 0) {
      const defaultLoc = locations.find(
        loc => loc.value === editingcamp.campLocation
      );
      setSelectedLocation(defaultLoc || null);
    } else {
      setSelectedLocation(null);
    }
  }, [editingcamp, locations]);

  useEffect(() => {
    if (fromTime && toTime && !invalidTime) {
      const slots = generateTimeSlots(fromTime, toTime);
      setTimeSlots(slots);
    }
  }, [fromTime, toTime, invalidTime]);

  useEffect(() => {
    if (fromTimeDaytwo && toTimeDaytwo && !invalidTimeDaytwo) {
      const slots = generateTimeSlots(fromTimeDaytwo, toTimeDaytwo);
      setTimeSlotsDaytwo(slots);
    }
  }, [fromTimeDaytwo, toTimeDaytwo, invalidTimeDaytwo]);

  //console.log(locations);
  const fetchcamp = async () => {
    try {
      const response = await axiosConfig.get('/api/camp/all');

      if (response.status === 200) {
        setCamps(response.data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchcamp();
  }, []);


  const [campDays, setCampDays] = useState(editingcamp?.campDays || '');
  const [minDate, setMinDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleCampDaysChange = (e) => {
    setCampDays(e.target.value);
  };



  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this camp?');

    if (isConfirmed && id) {
      try {
        const response = await axiosConfig.delete(`/api/camp/delete/${id}`)
        //console.log(response);

        if (response.status == 200) {
          setCamps(prev => prev.filter(campData => campData.id !== id));
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

  const handleOpenModal = (campData = null) => {
  setEditingcamp(campData);
  setModalOpen(true);
  
  
  if (campData) {
    setCampDays(campData.campDays); // ✅ Ensure this is set before modal renders
    setSelectedLocation({ value: campData.campLocation, label: campData.campLocation }); // ← Also helps
    const parsedTimeSlots = Array.isArray(campData.campTimeSlots)
      ? campData.campTimeSlots
      : JSON.parse(campData.campTimeSlots || '[]');
    setTimeSlots(parsedTimeSlots);

    const parsedTimeSlotsDaytwo = Array.isArray(campData.campTimeSlotsDaytwo)
      ? campData.campTimeSlotsDaytwo
      : JSON.parse(campData.campTimeSlotsDaytwo || '[]');
    setTimeSlotsDaytwo(parsedTimeSlotsDaytwo);

  } else {
    setCampDays('');
    setSelectedLocation(null);
    setTimeSlots([])
  }
};



const handleOpenModalbooking = (campbookingData = null) => {
  if (campbookingData) {
    setEditingcampbooking(campbookingData);
  }
  handleCloseViewcampModal();
  console.log(campbookingData);
  setViewcampModalOpenbooking(true);
};

const handleCloseModalbooking = () => {
  setEditingcampbooking(null);
  setViewcampModalOpenbooking(false);
};


const handleEditSlotSts = () => {
  setEditslotSts(true);
};

  const handleCloseModal = () => {
    setEditingcamp(null);
    setModalOpen(false);
    setEditslotSts(false);
  };

  const handleViewcampModal = (campData = null) => {
    setEditingcamp(campData);
    setViewcampModalOpen(true);
  };

  const handleCloseViewcampModal = () => {
    setEditingcamp(null);
    setViewcampModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
  e.preventDefault();
  setLoader(true);

  const form = e.target;

  // Extract values
  const campTitle = form.campTitle.value.trim();
  const campLocation = selectedLocation?.value || ''; // from react-select
  const campDays = form.campDays.value;
  const campDate = form.campDate?.value || '';
  const campFromDate = form.campFromDate?.value || '';
  const campToDate = form.campToDate?.value || '';
  const campTimingsFrom = form.campTimingsFrom.value;
  const campTimingsTo = form.campTimingsTo.value;
  const campTimingsFromDaytwo = form.campTimingsFromDaytwo?.value || '';
  const campTimingsToDaytwo = form.campTimingsToDaytwo?.value || '';
  const campAddress = form.campAddress.value.trim();
  const campShortDescription = form.campShortDescription.value.trim();
  const status = form.status?.value || 'Active';

  const tags = tagifyRef.current?.value || [];
  const keywords = tags.map(tag => tag.value).join(',');

  const payload = {
    campTitle,
    campLocation,
    campDays,
    campDate: campDays === '1 Day' ? campDate : '',
    campFromDate: campDays === '2 Days' ? campFromDate : '',
    campToDate: campDays === '2 Days' ? campToDate : '',
    campTimingsFrom,
    campTimingsTo,
    campTimingsFromDaytwo: campDays === '2 Days' ? campTimingsFromDaytwo : '',
    campTimingsToDaytwo: campDays === '2 Days' ? campTimingsToDaytwo : '',
    campAddress,
    keywords,
    campShortDescription,
    status,
    createdAt: editingcamp?.createdAt || new Date().toISOString(),
    campTimeSlots: timeSlots,                // day 1
    campTimeSlotsDaytwo: timeSlotsDaytwo     // optional for 2-day camp
  };
  setKeywords(keywords)

  try {
    if (editingcamp) {
      // Update request
      const response = await axiosConfig.put(`/api/camp/update/${editingcamp.id}`, {
        ...payload,
        id: editingcamp.id
      });

      if (response.status === 200) {
        setCamps(prev => prev.map(s => (s.id === editingcamp.id ? { ...payload, id: editingcamp.id } : s)));
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || 'Update failed.');
      }
    } else {
      // Create request
      const response = await axiosConfig.post('/api/camp/add', payload);

      if (response.status === 200 && response.data.insertId) {
        setCamps(prev => [{ ...payload, id: response.data.insertId }, ...prev]);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || 'Creation failed.');
      }
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Something went wrong.';
    toast.error(errMsg);
    console.error(error);
  }

  setLoader(false);
  handleCloseModal();
};


const handleFormSubmitbooking = async (e) => {
    e.preventDefault();
    setLoader(true);

    const form = e.target;

    // Extract values
    const comments = form.comments.value.trim();
    const status = form.status?.value;

    const payload = {
      comments,
      status
    };

    try {
      if (editingcampbooking) {
        // Update request
        const response = await axiosConfig.put(`/api/camp/updatecampbooking/${editingcampbooking.id}`, {
          ...payload,
          name: editingcampbooking.name,
          email: editingcampbooking.email,
          id: editingcampbooking.id,
          campDate: editingcampbooking.campDate,
          campLocation: editingcampbooking.campLocation,
          campRegistrationId: editingcampbooking.campRegistrationId
        });

        if (response.status === 200) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message || 'Update failed.');
        }
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Something went wrong.';
      toast.error(errMsg);
      console.error(error);
    }

    setLoader(false);
    handleCloseModalbooking();
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

  const toggleStatus = (campdata) => {
    const newStatus = campdata.status === "Active" ? "Inactive" : "Active";

    confirmToast(`Change status to ${newStatus}?`, async () => {
      const updatedcamp = { ...campdata, status: newStatus };

      try {
        const response = await axiosConfig.put(`/api/camp/updatestatus/${campdata.id}`, updatedcamp);

        if (response.status === 200) {
          setCamps(prev =>
            prev.map(u => u.id === campdata.id ? { ...u, status: newStatus } : u)
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

  const filteredcamps = camps.filter(campData =>
    campData.campTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campData.campLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    // { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Camp Title', selector: row => row.campTitle, sortable: true },
    { name: 'Location', selector: row => row.campLocation},
    { name: 'Camp Day(s)', selector: row => row.campDays },
    {
      name: 'Camp Date',
      selector: row => {
        if (row.campDate) {
          return format(row.campDate, 'dd MMMM yyyy hh:mm a');
        } else if (row.campFromDate && row.campToDate) {
          return `${format(row.campFromDate, 'dd MMMM yyyy')} - ${format(row.campToDate, 'dd MMMM yyyy')}`;
        } else if (row.campFromDate) {
          return format(row.campFromDate, 'dd MMMM yyyy');
        } else if (row.campToDate) {
          return format(row.campToDate, 'dd MMMM yyyy');
        } else {
          return 'N/A';
        }
      },
      width: '230px'
    },
    {
      name: 'Bookings',
      cell: row => (
        <button className="text-orange-600 px-1 py-[4px] rounded border hover:underline text-sm cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'View Camp Booking Informartion'} onClick={() => handleViewcampModal(row)}> {row.bookingsCount}</button>
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
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy hh:mm a'), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div>

          <button className="text-blue-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit Camp'} onClick={() => handleOpenModal(row)}><Pencil size={15} /></button>

          <button className="text-red-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Delete Camp'} onClick={() => handleDelete(row.id)}><Trash size={15} /></button>
          
          

        </div>
      ),
    },
  ];

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let [startH, startM] = start.split(':').map(Number);
    let [endH, endM] = end.split(':').map(Number);

    let current = new Date();
    current.setHours(startH, startM, 0, 0);

    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    while (current < endTime) {
      const next = new Date(current.getTime() + 30 * 60 * 1000);
      const slot = {
        from: current.toTimeString().substring(0, 5),
        to: next.toTimeString().substring(0, 5),
        status: 'AVAILABLE'
      };
      slots.push(slot);
      current = next;
    }

    return slots;
  };

  function formatDateToInputValue(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return (
    <div className="p-6 table_header_camps">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]">Camps</h1>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal()}
            data-tooltip-id="my-tooltip"
            data-tooltip-content={'Add Camp'}
            className="bg-[#f58737] text-white px-2 py-1.5 rounded text-sm cursor-pointer"
          >Add Camp
            {/* <Plus size={20} /> */}
          </button>
          <input
            type="text"
            placeholder="Search camps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />



        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredcamps}
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
              {editingcamp ? "Edit Camp" : "Add Camp"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">

                {/* Camp Title */}
                <div>
                    <label className="block text-sm font-medium pb-1">Camp Title</label>
                    <input
                    type="text"
                    name="campTitle"
                    defaultValue={editingcamp?.campTitle || ''}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                </div>

                {/* Camp Location */}
                <div>
                    
                    <label className="block text-sm font-medium pb-1">Location</label>
                    <Select
                        name="campLocation"
                        options={locations}
                        value={selectedLocation}
                        onChange={setSelectedLocation}
                        placeholder="Select Location"
                        className="text-sm"
                        classNamePrefix="react-select"
                        isSearchable
                    />
                </div>

                {/* Camp Days */}
                <div>
                    <label className="block text-sm font-medium pb-1">Camp Day(s)</label>
                    <select
                    name="campDays"
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                    onChange={handleCampDaysChange}
                    defaultValue={editingcamp?.campDays || ''}
                    required
                    >
                    <option value="">Select Camp Day(s)</option>
                    <option value="1 Day">1 Day</option>
                    <option value="2 Days">2 Days</option>
                    </select>
                </div>

                {/* Conditional Date Fields */}
                {campDays === '1 Day' && (
                    <div>
                    <label className="block text-sm font-medium pb-1">Camp Date</label>
                    <input
                        type="date"
                        name="campDate"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        min={minDate}
                        defaultValue={
                          editingcamp?.campDate
                            ? formatDateToInputValue(editingcamp.campDate)
                            : ''
                        }
                        required
                    />
                    </div>
                )}

                {campDays === '2 Days' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium pb-1">From Date</label>
                        <input
                        type="date"
                        name="campFromDate"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        min={minDate}
                        defaultValue={
                          editingcamp?.campFromDate
                            ? formatDateToInputValue(editingcamp.campFromDate)
                            : ''
                        }
                        required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium pb-1">To Date</label>
                        <input
                        type="date"
                        name="campToDate"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        min={minDate}
                        defaultValue={
                          editingcamp?.campToDate
                            ? formatDateToInputValue(editingcamp.campToDate)
                            : ''
                        }
                        required
                        />
                    </div>
                    </div>
                )}

                {/* Timings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* FROM */}
                    <div>
                        <label className="block text-sm font-medium pb-1">Timings From (Day 1)</label>
                        <input
                        type="time"
                        name="campTimingsFrom"
                        step="1800" // 30-minute intervals
                        defaultValue={editingcamp?.campTimingsFrom || ''}
                        onChange={handleFromTimeChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        required
                        />
                    </div>

                    {/* TO */}
                    <div>
                        <label className="block text-sm font-medium pb-1">Timings To (Day 1)</label>
                        <input
                        type="time"
                        name="campTimingsTo"
                        step="1800"
                        defaultValue={editingcamp?.campTimingsTo || ''}
                        onChange={handleToTimeChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        required
                        />
                        {invalidTime && (
                        <p className="text-sm text-red-500 mt-1">"To" time must be later than "From" time.</p>
                        )}
                    </div>
                </div>
                {campDays === '2 Days' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* FROM */}
                    <div>
                        <label className="block text-sm font-medium pb-1">Timings From (Day 2)</label>
                        <input
                          type="time"
                          name="campTimingsFromDaytwo"
                          step="1800"
                          defaultValue={editingcamp?.campTimingsFromDaytwo || ''}
                          onChange={handleFromTimeChangeDaytwo}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          required
                        />
                    </div>

                    {/* TO */}
                    <div>
                        <label className="block text-sm font-medium pb-1">Timings To (Day 2)</label>
                        <input
                          type="time"
                          name="campTimingsToDaytwo"
                          step="1800"
                          defaultValue={editingcamp?.campTimingsToDaytwo || ''}
                          onChange={handleToTimeChangeDaytwo}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          required
                        />
                        {invalidTimeDaytwo && (
                        <p className="text-sm text-red-500 mt-1">"To" time must be later than "From" time.</p>
                        )}
                    </div>
                </div>
                )}

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium pb-1">Address</label>
                    <input
                    type="text"
                    name="campAddress"
                    defaultValue={editingcamp?.campAddress || ''}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    required
                    />
                </div>

                {/* Keyword */}
                <div>
                    <label className="block text-sm font-medium pb-1">Keyword</label>
                    <Tags
                        tagifyRef={tagifyRef}
                        defaultValue={editingcamp?.campKeyword || keywords}
                        settings={{
                        whitelist: ["Health", "Outdoor", "Yoga", "Music", "Kids"],
                        dropdown: {
                            enabled: 0,
                            classname: "tags-look"
                        },
                        }}
                        onChange={onChangeTags}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                </div>

                {/* Short Description */}
                <div>
                    <label className="block text-sm font-medium pb-1">Short Description</label>
                    <textarea
                    name="campShortDescription"
                    defaultValue={editingcamp?.campShortDescription || ''}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    required
                    />
                </div>

                {/* Status (only while editing) */}
                {editingcamp && (
                    <div>
                    <label className="block text-sm font-medium pb-1">Status</label>
                    <select
                        name="status"
                        defaultValue={editingcamp?.status || 'Active'}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    </div>
                )}

                {EditslotSts && timeSlots.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Time Slots (Day 1)</h3>
                    <ul className="space-y-2">
                      {timeSlots.map((slot, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center border px-3 py-2 rounded text-sm"
                        >
                          <span>{slot.from} - {slot.to}</span>
                          <button
                            type="button"
                            className={`px-2 py-1 text-xs rounded ${
                              slot.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                            onClick={() => {
                              const updatedSlots = [...timeSlots];
                              updatedSlots[idx].status = slot.status === 'AVAILABLE' ? 'BOOKED' : 'AVAILABLE';
                              setTimeSlots(updatedSlots);
                            }}
                          >
                            {slot.status}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {EditslotSts && timeSlotsDaytwo.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Time Slots (Day 2)</h3>
                    <ul className="space-y-2">
                      {timeSlotsDaytwo.map((slot, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center border px-3 py-2 rounded text-sm"
                        >
                          <span>{slot.from} - {slot.to}</span>
                          <button
                            type="button"
                            className={`px-2 py-1 text-xs rounded ${
                              slot.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                            onClick={() => {
                              const updatedSlotsDaytwo = [...timeSlotsDaytwo];
                              updatedSlotsDaytwo[idx].status = slot.status === 'AVAILABLE' ? 'BOOKED' : 'AVAILABLE';
                              setTimeSlotsDaytwo(updatedSlotsDaytwo);
                            }}
                          >
                            {slot.status}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    {editingcamp && <button
                    type="button"
                    onClick={handleEditSlotSts}
                    className="px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer"
                    >
                    View / Edit Slot Status
                    </button>
                    }
                    
                    <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer"
                    >
                    Cancel
                    </button>
                    {loader ? (
                    <Loader className="animate-spin h-6 w-6 text-gray-500" />
                    ) : (
                    <button
                        type="submit"
                        className="px-2 py-1 text-sm bg-[#f58737] text-white rounded cursor-pointer"
                    >
                        {editingcamp ? 'Update' : 'Create'}
                    </button>
                    )}
                </div>
            </form>
          </div>
        </div>
      )}

      {modalViewcampOpenbooking && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50" onClick={handleCloseModalbooking}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">
              {editingcampbooking ? "View Camp Booking Information" : ""}
            </h2>

            {/* Equal Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Section: Order Details */}
              <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                <h3 className="text-md font-semibold mb-2">Booking Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  
                  <div className="font-medium">Camp Registration Id</div>
                  <div>{editingcampbooking.campRegistrationId}</div>

                  <div className="font-medium">Name</div>
                  <div>{editingcampbooking.name}</div>

                  <div className="font-medium">Email</div>
                  <div>{editingcampbooking.email}</div>

                  <div className="font-medium">Mobile</div>
                  <div>{editingcampbooking.mobile}</div>

                  <div className="font-medium">Camp Location</div>
                  <div>{editingcampbooking.campLocation}</div>

                  <div className="font-medium">Camp Address</div>
                  <div>{editingcampbooking.campAddress}</div>

                  <div className="font-medium">Subject Area</div>
                  <div>{editingcampbooking.subjectAreaTitle}</div>

                  <div className="font-medium">Academic Level</div>
                  <div>{editingcampbooking.academicLevel}</div>

                  <div className="font-medium">Current Status</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      editingcampbooking.status === "Not Attended"
                        ? "bg-red-100 text-red-700"
                        : editingcampbooking.status === "Attended"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {editingcampbooking.status}
                    </span>
                  </div>
                </div>
              </div>
              {/* Right Section: Order Package Summary */}
              <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                <h3 className="text-md font-semibold mb-2">Update Booking Status</h3>
                <form onSubmit={handleFormSubmitbooking} className="space-y-4 w-full md:flex md:items-end md:gap-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="block text-sm font-medium pb-1">Camp Date</div>
                  <div>{format(editingcampbooking.campDate, 'dd MMMM yyyy hh:mm a')}</div>

                  <div className="block text-sm font-medium pb-1">Camp Time Slot</div>
                  <div>{editingcampbooking.campTimeSlot}</div>

                  <div className="block text-sm font-medium pb-1">Message</div>
                  <div>{editingcampbooking.message}</div>
                  
                  {editingcampbooking?.status == null ? (
                  <>
                  <div>
                    <label className="block text-sm font-medium pb-1">Comments</label>
                      <textarea
                        className="form-control w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        rows="3"
                        name="comments"
                        id="comments"
                        defaultValue={editingcampbooking?.comments || ''}
                        required
                      />
                  </div>

                  <div>
                    <label className="block text-sm font-medium pb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingcampbooking?.status || ''}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Attended">Attended</option>
                      <option value="Not Attended">Not Attended</option>
                    </select>
                  </div>
                  <div>
                    {loader ? (
                      <Loader className="animate-spin h-6 w-6 text-gray-500" />
                    ) : (
                      <button
                        type="submit"
                        className="px-2 py-1 text-sm bg-[#f58737] text-white rounded cursor-pointer"
                      >
                        {editingcampbooking ? 'Update' : 'Create'}
                      </button>
                    )}
                  </div>
                  </>
                  ) : (
                  <>
                  <div className="block text-sm font-medium pb-1">Status</div>
                  <div>{editingcampbooking.status}</div>
                  <div className="block text-sm font-medium pb-1">Comments</div>
                  <div>{editingcampbooking.comments}</div>
                  </>
                  )}
                </div>
              </form>

              </div>
            </div>


          </div>
        </div>

      )}


      {modalViewcampOpen && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50 overflow-y-auto" onClick={handleCloseViewcampModal}>
         
          <div className="relative h-full w-full bg-white rounded-lg shadow-lg p-6 max-w-7xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">View Camp Booking Information</h2>
            <button
              type="button"
              onClick={handleCloseViewcampModal}
              className="px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer float-end"
              >
              X
              </button>
            <div className="space-y-4">
              {editingcamp && editingcamp.id && (
              <Campbooking campId={editingcamp.id} handleOpenModalbooking={handleOpenModalbooking} />
              )}
            </div>
            
          </div>
        </div>

      )}
    </div>
  );
}

export default Camps;
