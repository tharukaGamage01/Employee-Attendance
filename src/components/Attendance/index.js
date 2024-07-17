import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Header from "./Header";
import Table from "./Table";
import Add from "./Add";
import General from "./General";
import LateCount from "../LateCount";
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
  const [lateLunches, setLateLunches] = useState([]);

  const getAttendances = async () => {
    const querySnapshot = await getDocs(collection(db, "attendance"));
    const attendances = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAttendances(attendances);
    setFilteredAttendances(attendances);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lateLunchesToday = attendances
      .filter((attendance) => {
        if (attendance.lunchIn && attendance.lunchOut) {
          const lunchInDate = attendance.lunchIn.toDate();
          lunchInDate.setHours(0, 0, 0, 0);
          return lunchInDate.getTime() === today.getTime();
        }
        return false;
      })
      .map((attendance) => {
        const lunchDurationMs =
          attendance.lunchOut.toDate() - attendance.lunchIn.toDate();
        const minutes = Math.floor(lunchDurationMs / 60000);
        const seconds = Math.floor((lunchDurationMs % 60000) / 1000);
        return {
          PID: attendance.PID,
          fullName: attendance.fullName,
          lunchDuration: `${minutes} mins ${seconds} s`,
          lunchIn: attendance.lunchIn.toDate().toLocaleString(),
          lunchOut: attendance.lunchOut.toDate().toLocaleString(),
        };
      })
      .filter((attendance) => {
        const [minutes] = attendance.lunchDuration.split(" ");
        return parseInt(minutes) > 1;
      });
    setLateLunches(lateLunchesToday);
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
      if (result.isConfirmed) {
        deleteDoc(doc(db, "attendance", id))
          .then(() => {
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
          })
          .catch((error) => {
            console.error("Error deleting document: ", error);
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: "Failed to delete attendance record.",
              showConfirmButton: true,
            });
          });
      }
    });
  };

  const handleDownloadAttendancePDF = () => {
    const doc = new jsPDF();

    const headers = [
      "PID",
      "Full Name",
      "Clock-In",
      "Clock-Out",
      "Lunch Clock-In",
      "Lunch Clock-Out",
      "Meeting Clock-In",
      "Meeting Clock-Out",
    ];

    const data = filteredAttendances.map((attendance) => [
      attendance.PID,
      attendance.fullName,
      attendance.timeStamp
        ? attendance.timeStamp.toDate().toLocaleString()
        : "",
      attendance.timeOut ? attendance.timeOut.toDate().toLocaleString() : "",
      attendance.lunchIn ? attendance.lunchIn.toDate().toLocaleString() : "",
      attendance.lunchOut ? attendance.lunchOut.toDate().toLocaleString() : "",
      attendance.meetingIn
        ? attendance.meetingIn.toDate().toLocaleString()
        : "",
      attendance.meetingOut
        ? attendance.meetingOut.toDate().toLocaleString()
        : "",
    ]);

    doc.autoTable({
      head: [headers],
      body: data,
      startY: 10,
    });

    doc.save("Attendance.pdf");
  };

  const handleDownloadLateLunchPDF = () => {
    const doc = new jsPDF();

    const headers = [
      "PID",
      "Full Name",
      "Lunch Clock-In",
      "Lunch Clock-Out",
      "Lunch Duration (mins)",
    ];

    const data = lateLunches.map((lunch) => [
      lunch.PID,
      lunch.fullName,
      lunch.lunchIn,
      lunch.lunchOut,
      lunch.lunchDuration,
    ]);

    doc.autoTable({
      head: [headers],
      body: data,
      startY: 10,
    });

    doc.save("Late_Lunches.pdf");
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
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <button
              style={{
                borderRadius: "5px",
                fontSize: "14px",
                color: "#ffffff",
                backgroundColor: "#28a745",
                border: "none",
                padding: "10px 15px",
                cursor: "pointer",
              }}
              onClick={handleDownloadAttendancePDF}
            >
              Download Attendance PDF
            </button>
          </div>
          <LateCount lateLunches={lateLunches} />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <button
              style={{
                borderRadius: "5px",
                fontSize: "14px",
                color: "#000000",
                backgroundColor: "#ffc107",
                border: "none",
                padding: "10px 15px",
                cursor: "pointer",
              }}
              onClick={handleDownloadLateLunchPDF}
            >
              Download Late Lunches PDF
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
          setLateLunches={setLateLunches}
        />
      )}
    </div>
  );
};

export default Attendance;
