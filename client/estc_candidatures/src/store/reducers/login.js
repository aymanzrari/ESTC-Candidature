import * as actionTypes from '../actions/actionTypes';
import { updatedObject } from '../utility';

const initialState = {
    token: null,
    userId: null,
    error: null,
    auth: false,
    username: null
};

const authStart = (state, action) => {
    return updatedObject(state, { error: null });
}

const authSuccess = (state, action) => {
    return updatedObject(state, {
        token: action.token,
        userId: action.userId,
        error: null,
        auth: true,
        username: action.username
    });
}

const authFail = (state, action) => {
    return updatedObject(state, { error: action.error });
}

const authLogout = (state, action) => {
    return updatedObject(state, { token: null, userId: null });
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.AUTH_START: return authStart(state, action);
        case actionTypes.AUTH_SUCCESS: return authSuccess(state, action);
        case actionTypes.AUTH_FAIL: return authFail(state, action);
        case actionTypes.AUTH_LOGOUT: return authLogout(state, action);
        default:
            return state;
    }
};

export default reducer;