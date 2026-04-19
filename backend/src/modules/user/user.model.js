let users = [];

const createUser = (user)=>{
    user.plan = "free"
    users.push(user)
    return user
}

const findUserByEmail = (email)=>{
    return users.find((u)=> u.email ===email)
}

module.exports= {createUser, findUserByEmail}