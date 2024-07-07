import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";

import Header from "./Header";
import Table from "./Table";
import Add from "./Add";
import Edit from "./Edit";

import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firestore";

const Dashboard = ({ setIsAuthenticated }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAttend, setIsAttend] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, "employees"));
    const employees = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEmployees(employees);
    setFilteredEmployees(employees);
  };

  useEffect(() => {
    getEmployees();
  }, []);

  const handleEdit = (id) => {
    const [employee] = employees.filter((employee) => employee.id === id);

    setSelectedEmployee(employee);
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
        const [employee] = employees.filter((employee) => employee.id === id);

        deleteDoc(doc(db, "employees", id));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `${employee.firstName} ${employee.lastName}'s data has been deleted.`,
          showConfirmButton: false,
          timer: 1500,
        });

        const employeesCopy = employees.filter(
          (employee) => employee.id !== id
        );
        setEmployees(employeesCopy);
        setFilteredEmployees(employeesCopy);
      }
    });
  };

  const handleDownloadCSV = () => {
    const headers = ["First Name", "Last Name", "Email", "Salary", "Date"];

    const data = filteredEmployees.map((employee) => [
      employee.firstName,
      employee.lastName,
      employee.email,
      employee.salary,
      employee.date,
    ]);

    const content = `${headers.join(",")}\n${data
      .map((row) => row.join(","))
      .join("\n")}`;

    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "employees.csv");
  };

  const handleSearch = (query) => {
    const filtered = employees.filter((employee) => {
      return (
        employee.firstName.toLowerCase().includes(query.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(query.toLowerCase()) ||
        employee.email.toLowerCase().includes(query.toLowerCase())
      );
    });
    setFilteredEmployees(filtered);
  };

  return (
    <div className="container">
      {!isAdding && !isEditing && !isAttend && (
        <>
          <Header
            setIsAdding={setIsAdding}
            setIsAttend={setIsAttend}
            setIsAuthenticated={setIsAuthenticated}
            handleSearch={handleSearch}
          />

          <Table
            employees={filteredEmployees}
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
          employees={employees}
          setEmployees={setEmployees}
          setIsAdding={setIsAdding}
          getEmployees={getEmployees}
        />
      )}
      {isEditing && (
        <Edit
          employees={employees}
          selectedEmployee={selectedEmployee}
          setEmployees={setEmployees}
          setIsEditing={setIsEditing}
          getEmployees={getEmployees}
        />
      )}
    </div>
  );
};

export default Dashboard;
