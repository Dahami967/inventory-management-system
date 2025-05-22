const errorHandler = (err, req, res, next) => {
    console.error('Error details:', err);

    // MySQL error codes
    switch (err.code) {
        case 'ER_DUP_ENTRY':
            return res.status(400).json({
                message: 'A record with this information already exists.'
            });
            
        case 'ER_NO_REFERENCED_ROW':
        case 'ER_NO_REFERENCED_ROW_2':
            return res.status(400).json({
                message: 'Referenced record does not exist.'
            });
            
        case 'ER_BAD_FIELD_ERROR':
            return res.status(400).json({
                message: 'Invalid field in request.'
            });
            
        case 'ER_ACCESS_DENIED_ERROR':
            return res.status(500).json({
                message: 'Database access denied. Please contact administrator.'
            });
            
        case 'ECONNREFUSED':
            return res.status(500).json({
                message: 'Unable to connect to database. Please try again later.'
            });
            
        case 'ER_BAD_NULL_ERROR':
            return res.status(400).json({
                message: 'Required fields cannot be empty.'
            });
            
        default:
            return res.status(err.status || 500).json({
                message: err.message || 'An unexpected error occurred.'
            });
    }
};

module.exports = errorHandler;
