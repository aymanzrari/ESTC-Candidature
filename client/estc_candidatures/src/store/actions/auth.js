import * as actionTypes from './actionTypes';
import axios from 'axios';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

export const authSuccess = (token, userId, username) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        userId: userId,
        username: username
    };
};

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    };
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    return {
        type: actionTypes.AUTH_LOGOUT
    };
};

export const checkLoginTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000);
    };
};

export const auth = (username, password) => {
    return dispatch => {
        dispatch(authStart());
        const authData = {
            username: username,
            password: password,
            returnSecureToken: true
        };

        axios.post('http://127.0.0.1:8000/api/token/', authData).then(res => {
            const expirationDate = new Date(new Date().getTime() + res.data.expiresIn * 1000)
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('expirationDate', expirationDate);
            localStorage.setItem('userId', res.data.user_id);
            dispatch(authSuccess(res.data.token, res.data.user_id, res.data.username));
            dispatch(checkLoginTimeout(res.data.expiresIn));
        }).catch(err => {
            const error = "Le pseudo ou mot de passe est incorect";
            dispatch(authFail(error));
        })
    }
};

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if (expirationDate <= new Date()) {
                dispatch(logout());
            } else {
                const userId = localStorage.getItem('userId');
                const username = localStorage.getItem('username');
                dispatch(authSuccess(token, userId, username));
                dispatch(checkLoginTimeout((expirationDate.getTime() - new Date().getTime()) / 1000));
            }
        }
    };
};