exports.homePage = (req, res) => {
    res.render("index")
}

exports.myMiddleWare = (req, res, next) => {
    res.cookie('name', 'amrit pandey')
    next()
}