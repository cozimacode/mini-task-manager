import React from "react";
import { Avatar } from "@material-ui/core";
import styles from "../styles/Users.module.css";

export default function Users({ selectedUser, usersData, filterByUsers }) {
  return (
    <div className={styles.users}>
      {usersData.map((user) => (
        <Avatar
          key={user.id}
          onClick={() => filterByUsers(user.name)}
          className={
            selectedUser === user.name ? styles.imageSelected : styles.image
          }
          alt={user.name || "Anon"}
          src={user.picture}
        />
      ))}
    </div>
  );
}
