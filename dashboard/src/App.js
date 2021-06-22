import './App.css';
import NewTemplateView from "./components/NewTemplateForm/NewTemplateView";
import {useEffect, useReducer, useState} from "react";
import {Route, Redirect} from "react-router-dom";
import {
  AuthContext,
  initialState as initialAuthState,
  reducer as authReducer
} from "./context/AuthContext";
import LoginForm from "./components/Login/LoginForm";
import TemplateListView from "./components/TemplateListView/TemplateListView";
import {CheckToken} from "./service/fetch-service";

function App() {

  const [isLoading, setIsLoading] = useState(true)
  const [authState, authDispatch] = useReducer(authReducer, initialAuthState)
  useEffect(()=>{
    CheckToken(authState, authDispatch, setIsLoading)
  },[])
  return (
      <AuthContext.Provider
          value={{authState, authDispatch}}>
        <div className="App">

          {authState.isAuthenticated ?
              <div className="outer"><h1>Template Dashboard</h1>
                <Route exact path="/" component={TemplateListView}/>
                <Route path="/new" component={NewTemplateView}/>
              </div> : <LoginForm/>}
        </div>
      </AuthContext.Provider>
  );
}

export default App;
