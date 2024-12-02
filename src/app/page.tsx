"use client";

import React, { useContext, useEffect, useState } from "react";
import { FrameContext } from "../contexts/FrameContext";
import MiddleScreen from "./middle/page";
import LeftScreen from "./left/page";
const Main = () => {
  return (
    <div>
      <LeftScreen />
      <MiddleScreen />
    </div>
  );
};

export default Main;
