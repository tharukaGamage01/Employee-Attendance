import React from "react";
import Logout from "../Logout";

const Header = ({ setIsAdding, setIsAuthenticated, setIsAttend }) => {
  return (
    <header>
      <h1>The Employee List</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
        <button
          style={{
            color: "#ffffff",
            backgroundColor: "#007bff",
            border: "none",
          }}
          onClick={() => setIsAdding(true)}
        >
          Add Employee
        </button>
        {/* <button onClick={() => setIsAttend(true)}>Attendance Sheet</button> */}
        <Logout setIsAuthenticated={setIsAuthenticated} />
      </div>
    </header>
  );
};

export default Header;
