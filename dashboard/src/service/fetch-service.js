import {useRef} from "react";


export const FetchFile = async (url, authState, method, body = null) => {
  const headers = new Headers({
    'Authorization': `Bearer ${authState.token}`
  })
  let fetchInit = {
    headers,
  }
  if (body) {
    fetchInit = parseBody(fetchInit, body, authState.token, method)
  }

  return await fetch(authState.apiBaseUrl + url, fetchInit).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Bad response: ${response.status}`)
    }
    return response.blob()
  })
}

export const CheckToken = async (authState, authDispatch, setIsLoading) => {
  let token = localStorage.getItem('token')

  if (token) {
    token = JSON.parse(token)
    fetch(`${authState.apiBaseUrl}/check_token/`,
        {
          headers: {'Content-Type': 'application/json'},
          method: 'POST',
          body: JSON.stringify({access_token: token, token_type: 'Bearer'})
        })
        .then(response => response.json()
            .then(data => {
              if (response.status !== 200) {
                authDispatch({type: "LOGOUT"})
                setIsLoading(false)
              } else {
                authDispatch({
                  type: "LOGIN",
                  payload: data
                });
              }

            })).catch((e) => {
      authDispatch({type: "LOGOUT"});
    }).finally(() => setIsLoading(false))
  } else {
    setIsLoading(false)
  }
}

export const FetchAuth = async (
    authState,
    authDispatch,
    formData
) => {

  await fetch(authState.apiBaseUrl + '/token/', {
    method: 'POST',
    body: formData
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Bad response: ${response.status}`)
    }
    response.json().then(data => {
      authDispatch({
        type: 'LOGIN',
        payload: data
      })
    }).catch(err => console.log(err))
  })
}

export const parseBody = (fetchInit, body, token, method) => {
  fetchInit.method = method
  if (body instanceof FormData) {
    fetchInit.body = body
  } else {
    fetchInit.headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
    fetchInit.body = JSON.stringify(body)
  }
  return fetchInit
}

export const FetchWithToken = async (url, authState, setData = null, method = 'GET', body = null) => {
  const headers = new Headers({
    'Authorization': `Bearer ${authState.token}`
  })
  let fetchInit = {
    headers,
    method
  }
  if (body) {
    fetchInit = parseBody(fetchInit, body, authState.token, method)
  }


  return await fetch(authState.apiBaseUrl + url, fetchInit).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Bad response: ${response.status}`)
    }
    response.json().then(data => {
      if (setData) {
        return setData(data)
      }
      return data
    })
  }).catch(err => console.log(err))
}