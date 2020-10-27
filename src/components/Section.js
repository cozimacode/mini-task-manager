import React, { PureComponent } from "react";
import AddIcon from "@material-ui/icons/Add";
import CircularProgress from "@material-ui/core/CircularProgress";
import CRUDTask from "./CRUDTask";
import styles from "../styles/Section.module.css";

export default class Section extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      createMode: false,
      hovered: false,
    };
  }

  toggleIssue = () => {
    this.setState((state) => ({
      createMode: !state.createMode,
    }));
  };

  render() {
    let {
      priority,
      data,
      users,
      loading,
      refetch,
      reference,
      droppablePlaceholder,
    } = this.props;
    let { createMode, hovered } = this.state;
    let priorityType = {
      high: "High Priority",
      medium: "Medium Priority",
      low: "Normal Priority",
      done: "Finished",
    };
    return (
      <div
        onMouseEnter={() => this.setState({ hovered: true })}
        onMouseLeave={() => this.setState({ hovered: false })}
        className={styles[priority]}
        ref={reference}
      >
        <p className={styles.header}>{priorityType[priority]}</p>
        {loading ? (
          <div className={styles.loading}>
            <CircularProgress />
          </div>
        ) : (
          data.map((task, index) => (
            <CRUDTask
              toggle={this.toggleIssue}
              key={task.id}
              taskData={task}
              usersData={users}
              priority={task.priority}
              refetch={refetch}
              index={index}
            />
          ))
        )}
        {!createMode ? (
          <div
            style={{ display: hovered ? "flex" : "none" }}
            onClick={this.toggleIssue}
            className={styles.createIssue}
          >
            <AddIcon /> <p>Create Task</p>
          </div>
        ) : (
          <CRUDTask
            toggle={this.toggleIssue}
            priority={priority}
            initialMode="create"
            refetch={refetch}
            usersData={users}
          />
        )}
        {droppablePlaceholder}
      </div>
    );
  }
}
