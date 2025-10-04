import { motion } from "framer-motion"

const MealMenus = ({ notify }) => {

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: '50vh' }}
        >
            <div className="card shadow-lg p-4 align-items-center" onClick={e => e.stopPropagation()}
                style={{padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white', width: '40%'}}
                >

            </div>
        </motion.div>
    )
}

export default MealMenus