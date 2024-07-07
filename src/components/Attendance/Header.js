import React from "react";
import Logout from "../Logout";

const Header = ({ setIsAdding, setIsAuthenticated, setIsViewingGeneral }) => {
  return (
    <header>
      <h1>The Employee TimeSheet</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
        <button
          style={{
            color: "#ffffff",
            backgroundColor: "#007bff",
            border: "none",
          }}
          onClick={() => {
            setIsAdding(true);
            setIsViewingGeneral(false);
          }}
        >
          Time
        </button>
        <button
          style={{
            color: "#ffffff",
            backgroundColor: "#007bff",
            border: "none",
            marginLeft: "10px",
          }}
          onClick={() => {
            setIsAdding(false);
            setIsViewingGeneral(true);
          }}
        >
          General
        </button>
        <Logout setIsAuthenticated={setIsAuthenticated} />
      </div>
    </header>
  );
};

export default Header;
