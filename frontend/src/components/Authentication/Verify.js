import { Box, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const Verify = () => {
  let history = useHistory();
  //   const [token, setToken] = useState(window.location.search);

  useEffect(async () => {
    const queryParams = window.location.search;
    const urlParams = new URLSearchParams(queryParams);
    const tokenToSet = urlParams.get("token");
    const verifyConfig = {
      headers: {
        "Content-type": "application/json",
      },
    };
    try {
      const data = await axios.post(
        "/api/user/verify",
        { token: tokenToSet },
        verifyConfig
      );
      if (data.status === 200) {
        alert("Email Verified, press OK to login.");
        history.push("/");
        window.location.reload();
      }
    } catch (error) {
      alert("Aleady verified or token expired.");
    }
  }, []);
  return <Box width={"100%"} height={"100%"} display={"flex"}></Box>;
};

export default Verify;
