const asyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        return await requestHandler(req, res, next)
    } catch (err) {
        console.error(err); 
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

export {asyncHandler}