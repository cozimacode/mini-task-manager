import React, { Component } from "react";
import axios from "axios";
import devzaLogo from "./assets/devza_logo.png";
import Section from "./components/Section";
import Search from "./components/Search";
import Users from "./components/Users";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import "./styles/globalStyles.css";
import styles from "./App.module.css";

const functions = firebase.functions();
const AuthToken = functions.config().devza.auth_token;

const assignPriority = {
  // assigning a numeric value to priority for API
  highPriorityTasks: 3,
  mediumPriorityTasks: 2,
  normalPriorityTasks: 1,
  finishedTasks: 0,
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasksData: [],
      usersData: [],
      isLoading: true,
      selectedUser: "",
      searchInput: "",
      highPriorityTasks: [],
      mediumPriorityTasks: [],
      normalPriorityTasks: [],
      finishedTasks: [],
    };
  }

  componentDidMount() {
    this.fetchData();
    this.fetchUsers();
  }

  fetchData = async (triggerLoad) => {
    triggerLoad &&
      this.setState({
        isLoading: true,
      });

    let response = await axios.get("https://devza.com/tests/tasks/list", {
      headers: {
        AuthToken,
      },
    });

    this.setState({
      tasksData: response.data.tasks,
      isLoading: false,
    });

    this.populateTasksByPriority(response.data.tasks);
  };

  fetchUsers = async () => {
    let response = localStorage.getItem("usersData");

    if (response !== null) {
      response = JSON.parse(response);
      this.setState({ usersData: response });
    } else {
      response = await axios.get("https://devza.com/tests/tasks/listusers", {
        headers: {
          AuthToken,
        },
      });
      localStorage.setItem("usersData", JSON.stringify(response.data.users));
      this.setState({ usersData: response.data.users });
    }
  };

  filterTasksByUser = (name) => {
    let { tasksData, selectedUser } = this.state;
    let sortedByUser;

    if (selectedUser === name) {
      name = "";
      sortedByUser = tasksData;
    } else {
      sortedByUser = tasksData.filter((task) => task.assigned_name === name);
    }

    this.setState({ selectedUser: name, searchInput: "" });
    this.populateTasksByPriority(sortedByUser);
  };

  filterTasksBySearch = (input) => {
    let { tasksData } = this.state;

    let sortedBySearch = tasksData.filter(
      (task) => task.message.toLowerCase().indexOf(input.toLowerCase()) > -1
    );

    this.setState({ searchInput: input, selectedUser: "" });
    this.populateTasksByPriority(sortedBySearch);
  };

  populateTasksByPriority = (dataArray) => {
    let highPriorityTasks = dataArray.filter((task) => task.priority === "3");
    let mediumPriorityTasks = dataArray.filter((task) => task.priority === "2");
    let normalPriorityTasks = dataArray.filter((task) => task.priority === "1");
    let finishedTasks = dataArray.filter((task) => task.priority === "0");

    this.setState({
      highPriorityTasks,
      mediumPriorityTasks,
      normalPriorityTasks,
      finishedTasks,
    });
  };

  onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceSection = this.state[source.droppableId];
    const destinationSection = this.state[destination.droppableId];

    if (sourceSection === destinationSection) {
      const tempTasksArray = [...sourceSection];
      const [removedTask] = tempTasksArray.splice(source.index, 1);
      tempTasksArray.splice(destination.index, 0, removedTask);

      this.setState({
        [source.droppableId]: tempTasksArray,
      });
      return;
    } else {
      const sourceTempArray = [...sourceSection];
      const [removedTask] = sourceTempArray.splice(source.index, 1);
      const destinationTempArray = [...destinationSection];
      destinationTempArray.splice(destination.index, 0, removedTask);

      this.setState({
        [source.droppableId]: sourceTempArray,
        [destination.droppableId]: destinationTempArray,
      });
    }

    let data = new FormData();
    data.append("taskid", draggableId);
    data.append("priority", assignPriority[destination.droppableId]);

    await axios.post("https://devza.com/tests/tasks/update", data, {
      headers: {
        AuthToken,
        "Content-Type": "multipart/form-data",
      },
    });
  };

  render() {
    let {
      isLoading,
      usersData,
      selectedUser,
      searchInput,
      highPriorityTasks,
      mediumPriorityTasks,
      normalPriorityTasks,
      finishedTasks,
    } = this.state;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div className={styles.main}>
          <div className={styles.board}>
            <img className={styles.logo} alt="Devza" src={devzaLogo} />
            <div className={styles.sortTasks}>
              <Users
                usersData={usersData}
                filterByUsers={this.filterTasksByUser}
                selectedUser={selectedUser}
              />
              <Search input={searchInput} setInput={this.filterTasksBySearch} />
            </div>
          </div>
          <div className={styles.taskManager}>
            <Droppable droppableId="highPriorityTasks">
              {(provided) => (
                <Section
                  priority="high"
                  data={highPriorityTasks}
                  users={usersData}
                  loading={isLoading}
                  refetch={this.fetchData}
                  reference={provided.innerRef}
                  {...provided.droppableProps}
                  droppablePlaceholder={provided.placeholder}
                />
              )}
            </Droppable>
            <Droppable droppableId="mediumPriorityTasks">
              {(provided) => (
                <Section
                  priority="medium"
                  data={mediumPriorityTasks}
                  users={usersData}
                  loading={isLoading}
                  refetch={this.fetchData}
                  reference={provided.innerRef}
                  {...provided.droppableProps}
                  droppablePlaceholder={provided.placeholder}
                />
              )}
            </Droppable>
            <Droppable droppableId="normalPriorityTasks">
              {(provided) => (
                <Section
                  priority="low"
                  data={normalPriorityTasks}
                  users={usersData}
                  loading={isLoading}
                  refetch={this.fetchData}
                  reference={provided.innerRef}
                  {...provided.droppableProps}
                  droppablePlaceholder={provided.placeholder}
                />
              )}
            </Droppable>
            <Droppable droppableId="finishedTasks">
              {(provided) => (
                <Section
                  priority="done"
                  data={finishedTasks}
                  users={usersData}
                  loading={isLoading}
                  refetch={this.fetchData}
                  reference={provided.innerRef}
                  {...provided.droppableProps}
                  droppablePlaceholder={provided.placeholder}
                />
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    );
  }
}
