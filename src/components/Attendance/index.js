import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import Header from "./Header";
import Table from "./Table";
import Add from "./Add";
import General from "./General";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firestore";

const Attendance = ({ setIsAuthenticated }) => {
  const [attendances, setAttendances] = useState([]);
  const [filteredAttendances, setFilteredAttendances] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAttend, setIsAttend] = useState(false);
  const [isViewingGeneral, setIsViewingGeneral] = useState(false);

  const getAttendances = async () => {
    const querySnapshot = await getDocs(collection(db, "attendance"));
    const attendances = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAttendances(attendances);
    setFilteredAttendances(attendances);
  };

  useEffect(() => {
    getAttendances();
  }, []);

  const handleEdit = (id) => {
    const [attendance] = attendances.filter(
      (attendance) => attendance.id === id
    );
    setSelectedAttendance(attendance);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.value) {
        deleteDoc(doc(db, "attendance", id));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `Attendance record has been deleted.`,
          showConfirmButton: false,
          timer: 1500,
        });

        const attendancesCopy = attendances.filter(
          (attendance) => attendance.id !== id
        );
        setAttendances(attendancesCopy);
        setFilteredAttendances(attendancesCopy);
      }
    });
  };

  const handleDownloadCSV = () => {
    const headers = ["PID", "Full Name", "Time Stamp"];

    const data = filteredAttendances.map((attendance) => [
      attendance.PID,
      attendance.fullName,
      attendance.timeStamp.toDate().toLocaleString(),
    ]);

    const content = `${headers.join(",")}\n${data
      .map((row) => row.join(","))
      .join("\n")}`;

    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "attendance.csv");
  };

  const handleSearch = (query) => {
    const filtered = attendances.filter((attendance) => {
      return (
        attendance.PID.toLowerCase().includes(query.toLowerCase()) ||
        attendance.fullName.toLowerCase().includes(query.toLowerCase())
      );
    });
    setFilteredAttendances(filtered);
  };

  return (
    <div className="container">
      {!isAdding && !isEditing && !isAttend && !isViewingGeneral && (
        <>
          <Header
            setIsAdding={setIsAdding}
            setIsAuthenticated={setIsAuthenticated}
            setIsViewingGeneral={setIsViewingGeneral}
            handleSearch={handleSearch}
          />
          <Table
            attendances={filteredAttendances}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              style={{
                borderRadius: "5px",
                fontSize: "12px",
                color: "#ffffff",
                backgroundColor: "#28a745",
                border: "none",
                padding: "10px 10px",
                cursor: "pointer",
                marginRight: "10px",
              }}
              onClick={handleDownloadCSV}
            >
              Download CSV
            </button>
          </div>
        </>
      )}
      {isAdding && (
        <Add
          attendances={attendances}
          setAttendances={setAttendances}
          setIsAdding={setIsAdding}
          getAttendances={getAttendances}
        />
      )}
      {isViewingGeneral && (
        <General
          attendances={attendances}
          setAttendances={setAttendances}
          setIsAdding={setIsAdding}
          getAttendances={getAttendances}
          setIsViewingGeneral={setIsViewingGeneral}
        />
      )}
    </div>
  );
};

export default Attendance;
