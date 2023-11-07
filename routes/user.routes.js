const { isLoggedIn, checkRole } = require("../middleware/route-guard")
const User = require("../models/User.model")
const router = require("express").Router()

router.get("/student", isLoggedIn, (req, res) => {
    User
        .find({ role: { $eq: "STUDENT" } })
        .then(students => res.render("user/list", { students }))
        .catch(err => console.log(err))
})

router.get("/student/:id", isLoggedIn, (req, res) => {
    const { id } = req.params

    console.log(req.session.currentUser._id);

    User
        .findById(id)
        .then(student => res.render("user/profile",
            {
                student: student,
                isPM: req.session.currentUser.role === "PM",
                isOWNER: req.session.currentUser._id === student.id
            }))
        .catch(err => console.log(err))
})

router.get("/student/:id/edit", isLoggedIn, checkRole("STUDENT", "PM"), (req, res) => {
    const { id } = req.params
    if (req.session.currentUser._id === id) {
        User
            .findById(id)
            .then(user => res.render("user/edit", user))
            .catch(err => console.log(err))
    } else {
        res.redirect("/")
    }
})

router.post("/student/:id/edit", isLoggedIn, checkRole("STUDENT", "PM"), (req, res) => {
    const { id } = req.params
    const { username, email, profileImg, description } = req.body

    User
        .findByIdAndUpdate(id, { username, email, profileImg, description })
        .then(() => res.redirect("/student"))
        .catch(err => console.log(err))
})

router.post("/student/:id/delete", isLoggedIn, checkRole("PM"), (req, res) => {
    const { id } = req.params

    User
        .findByIdAndDelete(id)
        .then(() => res.redirect("/student"))
        .catch(err => console.log(err))
})

router.post("/student/:id/promote", isLoggedIn, checkRole("PM"), (req, res) => {
    const { id } = req.params
    const { role } = req.body

    if (role === 'DEV' || role === 'TA') {
        User
            .findByIdAndUpdate(id, { role })
            .then(() => res.redirect("/student"))
            .catch(err => console.log(err))
    }
    else {
        res.redirect("/student")
    }
})



module.exports = router