import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Header from "./Header";
import OrderModal from "./OrderModal";
import dayjs from "dayjs";

const statusMap = {
  toDo: "todo",
  ordered: "ordered",
  delivered: "delivered",
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState({
    toDo: { name: "Att beställa", items: [] },
    ordered: { name: "Beställd", items: [] },
    delivered: { name: "Levererad", items: [] },
    assigned: { name: "Mina uppgifter", items: [] },
  });

  const [input, setInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const user = JSON.parse(localStorage.getItem("user"));
  const isManagerOrAdmin = user?.role === "manager" || user?.role === "admin";

  const fetchOrders = async () => {
    const res = await axios.get("/orders");
    const newCols = {
      toDo: { name: "Att beställa", items: [] },
      ordered: { name: "Beställd", items: [] },
      delivered: { name: "Levererad", items: [] },
      assigned: { name: "Mina uppgifter", items: [] },
    };

    res.data.forEach((order) => {
      const key = Object.keys(statusMap).find(
        (k) => statusMap[k] === order.status
      );
      if (key) newCols[key].items.push(order);
    });

    if (user?.role === "manager") {
      const assignedRes = await axios.get("/orders/my-tasks");
      newCols.assigned.items = assignedRes.data;
    }

    setColumns(newCols);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAddItem = async () => {
    if (!input.trim()) return;
    const res = await axios.post("/orders", { item: input });
    setColumns((prev) => ({
      ...prev,
      toDo: {
        ...prev.toDo,
        items: [
          ...prev.toDo.items,
          {
            id: res.data._id,
            item: res.data.item,
            status: "todo",
            createdAt: res.data.createdAt,
          },
        ],
      },
    }));
    setInput("");
  };

  const onDragEnd = async (result) => {
    if (!isManagerOrAdmin) return;
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const [movedItem] = sourceCol.items.splice(source.index, 1);
    destCol.items.splice(destination.index, 0, movedItem);

    const timestampField =
      destination.droppableId === "ordered"
        ? "orderedAt"
        : destination.droppableId === "delivered"
        ? "deliveredAt"
        : null;

    if (timestampField) {
      movedItem[timestampField] = new Date().toISOString();
    }

    const newCols = {
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    };

    setColumns(newCols);

    await axios.put(`/orders/${movedItem._id}`, {
      status: statusMap[destination.droppableId],
      ...(timestampField
        ? { [timestampField]: movedItem[timestampField] }
        : {}),
    });
  };

  const filterAndSort = (items) => {
    let filtered = items.filter((item) =>
      item.item?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    switch (sortBy) {
      case "createdAt":
        return filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "orderedAt":
        return filtered.sort(
          (a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0)
        );
      case "deliveredAt":
        return filtered.sort(
          (a, b) => new Date(b.deliveredAt || 0) - new Date(a.deliveredAt || 0)
        );
      case "status":
        return filtered.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return filtered;
    }
  };


};

export default KanbanBoard;
