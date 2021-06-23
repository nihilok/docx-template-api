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
import RenderTemplateForm from "./components/RenderTemplate/RenderTemplateForm";

function App() {

  const [isLoading, setIsLoading] = useState(true)
  const [authState, authDispatch] = useReducer(authReducer, initialAuthState)
  useEffect(() => {
    CheckToken(authState, authDispatch, setIsLoading)
  }, [])
  return (
      <AuthContext.Provider
          value={{authState, authDispatch}}>
        <div className="App">

          {authState.isAuthenticated ?
              <div className="outer container"><h1>Template Dashboard</h1>
                <Route exact path="/" component={TemplateListView}/>
                <Route path="/new" component={NewTemplateView}/>
                <Route path="/render/:id" component={RenderTemplateForm}/>
                <Route path="/logout"
                       component={() => {
                         authDispatch({type: 'LOGOUT'})
                         return <Redirect to="/"/>
                       }}/>
              </div> : <div className="container"><LoginForm/></div>}
        </div>
      </AuthContext.Provider>
  );
}

export default App;
