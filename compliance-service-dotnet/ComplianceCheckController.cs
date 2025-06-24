
using Microsoft.AspNetCore.Mvc;

namespace ComplianceService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ComplianceCheckController : ControllerBase
    {
        [HttpPost]
        public IActionResult Check([FromBody] UserRequest req)
        {
            if (req.KycApproved && req.Balance >= 100)
                return Ok(new { status = "Approved" });
            return BadRequest(new { status = "Rejected" });
        }

        public class UserRequest
        {
            public bool KycApproved { get; set; }
            public int Balance { get; set; }
        }
    }
}
