import React, { useState } from "react";
import { TextField, Avatar, IconButton, Tooltip } from "@material-ui/core";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import EditIcon from "@material-ui/icons/Edit";
import CloseIcon from "@material-ui/icons/Close";
import Autocomplete from "@material-ui/lab/Autocomplete";
import userAvatar from "../data/userAvatar.json";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import axios from "axios";
import { Draggable } from "react-beautiful-dnd";
import styles from "../styles/CRUDTask.module.css";

const functions = firebase.functions();
const AuthToken = functions.config().devza.auth_token;

export default function CRUDTask({
  priority,
  toggle = () => {}, // cause we don't need toggle function in read and update modes
  initialMode = "read",
  taskData = false,
  usersData,
  refetch,
  index,
}) {
  const [message, setMessage] = useState(
    initialMode === "read" ? taskData.message : ""
  );
  const [user, setUser] = useState(
    initialMode === "read"
      ? {
          name: taskData.assigned_name,
          picture: userAvatar[taskData.assigned_name],
          id: taskData.assigned_to,
        }
      : ""
  );
  const [mode, setMode] = useState(initialMode); // facilitates changing of create, update and read modes as necessary and avoid code duplication
  const [selectedDate, setSelectedDate] = useState(
    initialMode === "read" ? new Date(taskData.due_date) : new Date()
  );

  function handleInput(e) {
    setMessage(e.target.value);
  }

  function handleAutocomplete(userObj) {
    setUser(userObj);
  }

  function handleDateChange(date) {
    setSelectedDate(date);
  }

  function generateDueDate() {
    // to parse the date in a format accepted by the API
    return `${selectedDate.getFullYear()}-${
      selectedDate.getMonth() + 1
    }-${selectedDate.getDate()} 12:12:12`;
  }

  async function handleDelete() {
    let data = new FormData();
    data.append("taskid", taskData.id);

    await axios.post("https://devza.com/tests/tasks/delete", data, {
      headers: {
        AuthToken,
        "Content-Type": "multipart/form-data",
      },
    });

    setMode("delete");
    refetch(false);
  }

  const assignPriority = {
    // assigning a numeric value to priority for API
    high: 3,
    medium: 2,
    low: 1,
    done: 0,
  };

  async function handleSubmit() {
    let data = new FormData();
    let endPoint =
      mode === "update"
        ? "https://devza.com/tests/tasks/update"
        : "https://devza.com/tests/tasks/create";

    data.append("message", message);
    data.append("due_date", generateDueDate());
    data.append("priority", assignPriority[priority]);
    data.append("assigned_to", user.id);
    mode === "update" && data.append("taskid", taskData.id); // taskid is only required during update

    await axios.post(endPoint, data, {
      headers: {
        AuthToken,
        "Content-Type": "multipart/form-data",
      },
    });

    refetch(false); // To allow screen refresh after creating new task
    mode === "update" && setMode("read"); // Helps prevent a reload
    mode === "create" && setTimeout(() => toggle(), 1500); // To close the new task form
  }

  return (
    <Draggable draggableId={taskData.id} index={index}>
      {(provided) => (
        <div
          className={
            mode === "update"
              ? styles.updating
              : mode === "delete"
              ? styles.deleting
              : styles.main
          }
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <textarea
            className={styles.textArea}
            rows={3}
            name="message"
            placeholder="What needs to be done?"
            value={message}
            onChange={handleInput}
            readOnly={mode === "read"}
          />
          <Tooltip
            title={mode === "read" ? "Delete" : "Close"}
            arrow
            placement="bottom"
          >
            <IconButton
              onClick={
                mode === "read"
                  ? handleDelete
                  : mode === "update"
                  ? () => setMode("read")
                  : toggle
              }
              className={styles.closeIcon}
              aria-label={mode === "read" ? "delete" : "close"}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <div className={styles.assignUser}>
            {mode === "read" || mode === "delete" ? (
              <TextField
                size="small"
                style={{ width: 180, margin: "0 10px" }}
                label="Assigned to"
                variant="outlined"
                value={user.name || "None"}
                disabled={mode === "read"}
              />
            ) : (
              <Autocomplete
                className={styles.autoComplete}
                options={usersData}
                format="yyyy/MM/dd"
                onChange={(event, userObj, reason) =>
                  handleAutocomplete(userObj)
                }
                getOptionLabel={(option) => option.name}
                size="small"
                style={{ width: 180 }}
                renderInput={(params) => (
                  <TextField {...params} label="Assign to" variant="outlined" />
                )}
              />
            )}
            {user && <Avatar alt={user.name || "Anon"} src={user.picture} />}
          </div>
          <div className={styles.dueDate}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                inputVariant="outlined"
                size="small"
                format="yyyy/MM/dd"
                margin="normal"
                label="Due date"
                value={selectedDate}
                onChange={handleDateChange}
                disabled={mode === "read"}
                autoOk={true}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </MuiPickersUtilsProvider>
            {mode === "read" || mode === "delete" ? (
              <>
                <Tooltip title="Edit" arrow placement="bottom">
                  <IconButton onClick={() => setMode("update")}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <div {...provided.dragHandleProps}>
                  <DragIndicatorIcon />
                </div>
              </>
            ) : (
              <>
                <Tooltip title="Submit" arrow placement="bottom">
                  <IconButton
                    onClick={handleSubmit}
                    disabled={message.length < 1}
                    aria-label="submit"
                  >
                    <DoubleArrowIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
