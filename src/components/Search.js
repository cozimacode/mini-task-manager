import React from "react";
import SearchIcon from "@material-ui/icons/Search";
import styles from "../styles/Search.module.css";

export default function Search({ input, setInput }) {
  return (
    <div className={styles.main}>
      {!input && <SearchIcon className={styles.icon} />}
      <input
        type="text"
        value={input}
        placeholder="Search"
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
}
