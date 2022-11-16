import { push } from "react-router-redux"

import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import { Link } from "react-router"
import { connect } from "react-redux"
import { submissionCloneAll } from "../../../modules/submissions/actions/submission-clone-all"
import Footer from "../../shared/components/Footer"

const ConfirmFooter = ({
  confirmClickHandler
}) => {
  const [disable, setDisable] = useState(false);
  const deadline = new Date(2022, 10, 19, 0, 1, 0); //FIX_TIME_HERE
  const [curDate, setCurDate] = useState(new Date());
  const cloneall = () => {
    confirmClickHandler();
  }
  useEffect(()=>{
    const interval_t = deadline.getTime() - curDate.getTime();
    let timer;
    if (interval_t > 0){
      timer = setTimeout(cloneall
      , interval_t);
    }
    return () => clearTimeout(timer);
  }, [])
  
  console.log('get_time1 %s %s', deadline, curDate)
  console.log('get_time2 %d %d', deadline.getTime(), curDate.getTime())
  return (
    <Footer>
      <Link to="/select" key={0}>
        <button className="btn btn-danger">Back</button>
      </Link>
      <button
        className="btn btn-success pull-right"
        onClick={() => {
          setDisable(true);
        }}
        disabled={disable}
      >
        Archive
      </button>
    </Footer>
  )
}

ConfirmFooter.propTypes = {
  confirmClickHandler: PropTypes.func.isRequired
}

const mapDispatchToProps = (dispatch) => ({
  confirmClickHandler: () => {
    dispatch(push("/archive"));
    dispatch(submissionCloneAll());
  }
})

export default connect(null, mapDispatchToProps)(ConfirmFooter)
