import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
//import Button from "@mui/material/Button";
//import EditIcon from "@mui/icons-material/Edit";

const Mainpage = () => {
  const navigate = useNavigate();

  const handleEmployeesClick = () => {
    navigate("/dashboard");
  };

  const handleAttendanceClick = () => {
    navigate("/attendance");
  };

  return (
    <div className="main-container">
      <button className="styled-button" onClick={handleEmployeesClick}>
        Employees
      </button>
      <button className="styled-button" onClick={handleAttendanceClick}>
        Attendance
      </button>
      <button className="styled-button">Special</button>
    </div>
  );
};

export default Mainpage;
