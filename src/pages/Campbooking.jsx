import React, { useState, useEffect, useRef } from 'react';
import axiosConfig, { BASE_URL, FILE_PATH } from '../axiosConfig';
import DataTable from 'react-data-table-component';
import toast from "react-hot-toast";
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil, Trash, Loader } from "lucide-react";
import Packages from "./Packages";

import Select from 'react-select';
import Tags from "@yaireo/tagify/dist/react.tagify";
import "@yaireo/tagify/dist/tagify.css";



function Campbooking({campId,handleOpenModalbooking}) {
  
  const d = new Date();
  const formattedDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  const [loader, setLoader] = useState(false);

  const [camps, setCamps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  //console.log(locations);
  const fetchcampbooking = async () => {
    try {
      const response = await axiosConfig.get(`/api/camp/campbookings/${campId}`);

      if (response.status === 200) {
        setCamps(response.data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchcampbooking();
  }, []);

  const filteredcamps = camps.filter(campData =>
    campData.campTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campData.campLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    // { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'Registration Id', selector: row => row.campRegistrationId, sortable: true },
    { name: 'Camp Title', selector: row => row.campTitle, sortable: true },
    {
      name: 'Camp Date',
      selector: row => {
        if (row.campDate) {
          return format(row.campDate, 'dd MMMM yyyy');
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
      width: '150px'
    },
    { name: 'Camp Time Slot', selector: row => row.campTimeSlot,
      width: '120px'},
    { name: 'Name', selector: row => row.name},
    { name: 'Created At', selector: row => format(row.createdAt, 'dd MMMM yyyy hh:mm a'), sortable: true,
      width: '180px' },
    {
      name: 'Actions',
      cell: row => (
        <div>
          <button className="text-blue-600 px-1 py-[4px] rounded border hover:underline text-sm mr-3 cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={'Edit Camp'} onClick={() => handleOpenModalbooking(row)}><Pencil size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 table_header_camps">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#000]"></h1>
        <div className="flex gap-3">
          {/* <input
            type="text"
            placeholder="Search camps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          /> */}



        </div>
      </div>
      {loader ? (
      <Loader className="animate-spin h-6 w-6 text-gray-500" />
      ) : (
      <DataTable
        columns={columns}
        data={filteredcamps}
        pagination
        highlightOnHover
        striped
        responsive
      />
      )}

      
    </div>
  );
}

export default Campbooking;
