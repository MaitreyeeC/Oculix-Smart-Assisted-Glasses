import { useEffect, useState } from "react";

export default function Emergency() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const API_BASE = "http://localhost:8000/emergency";

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_BASE}/contacts`);
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.log("Error fetching contacts:", err);
    }
  };

  const addContactAPI = async () => {
    try {
      await fetch(`${API_BASE}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      fetchContacts();
    } catch (err) {
      console.log("Error adding contact:", err);
    }
  };

  const deleteContactAPI = async (phoneNum) => {
    try {
      await fetch(`${API_BASE}/contacts/${phoneNum}`, {
        method: "DELETE",
      });
      fetchContacts();
    } catch (err) {
      console.log("Error deleting contact:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const addContact = () => {
    if (!name || !phone) return;
    addContactAPI();
    setName("");
    setPhone("");
  };

  const deleteContact = (index) => {
    const phoneToDelete = contacts[index].phone;
    deleteContactAPI(phoneToDelete);
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1>🚨 Emergency Contacts</h1>
      <p style={{ fontSize: "14px", opacity: 0.7 }}>
        These contacts can be alerted in case of a fall or emergency.
      </p>

      <div style={{ marginTop: "16px", marginBottom: "20px" }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <button onClick={addContact}>Add</button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {contacts.map((c, i) => (
          <li
            key={i}
            style={{
              padding: "10px 14px",
              marginBottom: "8px",
              borderRadius: "10px",
              background: "white",
              boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: "13px" }}>{c.phone}</div>
            </div>
            <button onClick={() => deleteContact(i)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
