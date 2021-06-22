import React, {useRef, useContext, useState} from 'react';
import {AuthContext} from "../../context/AuthContext";
import Loader from "../Loaders/Loader";
import {FetchAuth} from "../../service/fetch-service";

const Login = () => {
  const {authState, authDispatch} = useContext(AuthContext)

  const initialState = {
    username: "",
    password: "",
    isSubmitting: false,
    errorMessage: null
  };

  const [data, setData] = useState(initialState);
  const handleInputChange = event => {
    setData({
      ...data,
      [event.target.name]: event.target.value
    });
  };
  const form = useRef(null)
  const handleSubmit = (evt) => {
    evt.preventDefault();
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null
    });
    let formData = new FormData(form.current)
    FetchAuth(authState, authDispatch, formData)
        .catch(error => {
          setData({
            ...data,
            isSubmitting: false,
            errorMessage: error.message || error.statusText
          });
        });
  };

  return (

      <div className="full-page-component">
        <form ref={form} onSubmit={handleSubmit} className={"form-group"}>
          <div className="form-control">
            <label htmlFor="username">Username</label><input name="username" type="text"
                                                             placeholder="Username"
                                                             value={data.username}
                                                             onChange={handleInputChange}
                                                             className=""/></div>
          <div className="form-control">
            <label htmlFor="password">Password</label><input name="password" type="password" placeholder="Password"
                                                             value={data.password}
                                                             onChange={handleInputChange}
                                                             className=""/></div>
          <input type="submit" value="Sign In"
                 className="btn"/>


          {data.isSubmitting ? <Loader/> : ''}
        </form>
      </div>
  )
};

export default Login;