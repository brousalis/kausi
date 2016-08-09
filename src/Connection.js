import React, { Component } from "react";
import reactMixin from "react-mixin";
import Firebase from "firebase";
import ReactFire from "reactfire";
import moment from "moment";

import Controls from "./Controls";
import Week from "./Week";
// import Day from "./Day";
// import Month from "./Month";
// import Year from "./Year";

class Connection extends Component {
  constructor(props) {
    super(props);

    Firebase.initializeApp({
      authDomain: "muisti-6a29a.firebaseapp.com",
      apiKey: "AIzaSyAF4obcBK8wggQq9klNNkHH-dolEoNhlLM",
      databaseURL: "https://muisti-6a29a.firebaseio.com",
    });

    this.state = {
      user: {
        uid: null,
        anonymous: null,
      },
      todos: [],
      view: "week",
      date: moment().startOf("day"),
    }

    this.saveTodo = this.saveTodo.bind(this);
  }

  componentWillMount() {
    Firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("User authenticated:");
        console.log(user);
        this.setState({
          user: {
            uid: user.uid,
            anonymous: user.isAnonymous,
          }
        });
        this.setupSubscription(this.state.user.uid);
      } else {
        console.log("User not authenticated");
        this.setState({
          user: {
            uid: null,
            anonymous: null,
          }
        });
        this.signIn();
      }
    }.bind(this));
  }

  setupSubscription(uid) {
    this.firebaseRef = Firebase.database().ref(uid);

    this.bindAsArray(
      this.firebaseRef,
      "todos",
      function(error) {
        console.log("Firebase subscription cancelled:")
        console.log(error);
      }
    );
  }

  signIn() {
    console.log("Trying to sign in…");
    Firebase.auth().signInAnonymously().catch(function(error) {
      console.log(error);
    });
  }

  signOut() {
    console.log("Trying to sign out…");
    Firebase.auth().signOut().catch(function(error) {
      console.log(error);
    });
  }

  signUp() {
    console.log("Trying to sign up…");
    // TODO
  }

  saveTodo(key, day, text) {
    if (!key && text) {
      key = this.firebaseRef.push().key;
    }
    if (key) {
      this.firebaseRef.update({
        [key]: {
          date: day,
          text: text,
        }
      });
    }
  }

  render() {
    let controls, message, view;

    if (this.state.user.uid) {
      controls = (
        <Controls
          user={this.state.user}
          signIn={this.signIn}
          signOut={this.signOut}
          signUp={this.signUp}
        />
      );
    }
    else {
      message = (
        <div className="text-align-center color-bright-5 padding-0-5">
          Connecting…
        </div>
      );
    }

    switch (this.state.view) {
      case "week":
      default:
        view = (
          <Week
            todos={this.state.todos}
            date={this.state.date}
            saveTodo={this.saveTodo}
          />
        );
    }

    return (
      <div id="connection" className="flex vertical height-100vh">
        {view}
        {controls}
        {message}
      </div>
    );
  }
}

reactMixin(Connection.prototype, ReactFire);
export default Connection;
