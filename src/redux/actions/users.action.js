import { api_userWithFillter } from "../../api_services";
import {
  GET_USERS_LIST_FAIL,
  GET_USERS_LIST_REQUEST,
  GET_USERS_LIST_SUCCESS,
  USERS_REDUCER_REFRESH,
} from "../reducers/actionTypes";

// get user
export const getUsersList = (data) => async (dispatch) => {
  dispatch({
    type: USERS_REDUCER_REFRESH,
  });
  console.log(data, "GET FILTER USER QUERY");
  dispatch({
    type: GET_USERS_LIST_REQUEST,
  });

  try {
    const response = await api_userWithFillter(data);
    console.log(response, "getUsersList()");
    if (response.statusCode === 200) {
      dispatch({
        type: GET_USERS_LIST_SUCCESS,
        payload: response.items,
      });
    } else {
      throw response;
    }
  } catch (error) {
    dispatch({
      type: GET_USERS_LIST_FAIL,
      payload: error?.error || error.message || "something went wrong",
    });
  }
};
