async function isLoggedIn(req,res,next) {
    if(req.session.user){
        next();
    }
    else
        {
            return res.render("homepage",{message:"Login First"})
        }    
}
module.exports={isLoggedIn};